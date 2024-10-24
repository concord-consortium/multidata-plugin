import { Over, useDndContext, useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react-lite";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { useDraggableTableContext, Side } from "../../../hooks/useDraggableTable";
import { useTableTopScrollTopContext } from "../../../hooks/useTableScrollTop";
import {
  displayFormulaEditor, endCodapDrag, moveCodapDrag, sortAttribute, startCodapDrag
} from "../../../utils/apiHelpers";
import { getDisplayValue } from "../../../utils/utils";
import {
  ICollection, ICollections, IDndData, IProcessedCaseObj, isCollectionData, PropsWithChildren
} from "../../../types";
import { EditableTableCell } from "./editable-table-cell";
import { AddAttributeButton } from "./add-attribute-button";
import { EditableTableHeader } from "./editable-table-header";

import AddIcon from "../../../assets/plus-level-1.svg";
import DropdownIcon from "../../../assets/dropdown-arrow-icon.svg";

import css from "./tables.scss";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;
const kCellHeight = 16;
const kMinNumHeaders = 3;

function getId(collectionId: number, attrTitle?: string, caseId?: number) {
  const base = `${collectionId}-${attrTitle}`;
  return caseId != null ? `${caseId}-${base}` : base;
}

const getStyle = (collectionId: number, attrTitle?: string, over?: Over|null, dragSide?: Side) => {
  if (attrTitle == null) return {};

  const data = over?.data.current as IDndData;
  const hovering = collectionId === data?.collectionId && (attrTitle == null || attrTitle === data?.attrTitle);
  return hovering ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {};
};

interface DraggableTableHeaderProps {
  collectionId: number;
  attrTitle: string;
  caseId?: number;
  colSpan?: number;
  dataSetName: string;
  dataSetTitle: string;
  isParent?: boolean;
  editableHasFocus?: boolean;
  attrId?: number;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export const DraggableTableHeader: React.FC<PropsWithChildren<DraggableTableHeaderProps>> =
  observer(function DraggagleTableHeader(props) {
    const {collectionId, attrTitle, caseId, dataSetName, editableHasFocus, children,
       isParent, attrId, renameAttribute, colSpan} = props;

    // Manage header dropdown menus
    const [showDropdownIcon, setShowDropdownIcon] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const headerRef = useRef<HTMLTableCellElement | null>(null);
    const headerPos = headerRef.current?.getBoundingClientRect();
    const headerMenuRef = useRef<HTMLDivElement | null>(null);
    const tableContainer = document.querySelector(".nested-table-nestedTableWrapper");

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (headerMenuRef.current &&
          !headerMenuRef.current.contains(e.target as Node) &&
          !headerRef.current?.contains(e.target as Node)
        ) {
          setShowHeaderMenu(false);
        }
      };
      if (showHeaderMenu) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showHeaderMenu, tableContainer]);

    const handleShowHeaderMenu = (e: React.MouseEvent<HTMLTableCellElement | HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowHeaderMenu(!showHeaderMenu);
    };

    const handleSortAttribute = (isDescending = false) => {
      sortAttribute(dataSetName, attrTitle, isDescending);
    };

    const handleDisplayFormulaEditor = () => {
      displayFormulaEditor(dataSetName, attrTitle);
    };

    // Manage synthetic drag in Codap via API requests

    // Basic setup
    const { dragSide, handleDragOver } = useDraggableTableContext();
    const id = getId(collectionId, attrTitle, caseId);
    const data = { type: "attribute", collectionId, attrTitle };
    const { over, setNodeRef: setDroppableRef } = useDroppable({ id, data });
    const baseStyle = getStyle(collectionId, attrTitle, over, dragSide);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data });
    const style = { ...baseStyle, ...transform };

    // True if the global drag listeners have already been set up
    const globalListeners = useRef(false);
    // The pointerId is saved on pointerDown and monitors pointer events after the drag actually starts
    const pointerId = useRef<number|null>();
    // Saving the drag Over in a ref ensures it is always up to date in an event listener
    // TODO This causes a bug, where updates to left/right are one frame behind
    const draggingOver = useRef<Over|null>();
    const dragInCodap = useCallback(() => {
      // Bail if we have already set up global listeners or don't know the pointerId
      if (globalListeners.current || pointerId.current == null) return;

      // Listen for pointer events everywhere, even outside the plugin
      globalListeners.current = true;
      const { body } = document;
      body.setPointerCapture(pointerId.current);

      // Initialize drag in Codap
      const rect = headerRef.current?.getBoundingClientRect();
      startCodapDrag(dataSetName, attrTitle, rect?.height, rect?.width);

      // Notify Codap of pointer moves while dragging
      let allowMove = true; // Throttle API requests to 30/second
      const handleGlobalPointerMove = (e: PointerEvent) => {
        if (allowMove) {
          allowMove = false;
          moveCodapDrag(dataSetName, attrTitle, e.clientX, e.clientY);
          setTimeout(() => allowMove = true, 33);
        }
        handleDragOver(e.clientX, draggingOver.current || undefined);
      };
      body.addEventListener("pointermove", handleGlobalPointerMove);

      // Notify Codap when the drag ends and clean up listeners
      const handlePointerUp = (e: PointerEvent) => {
        endCodapDrag(dataSetName, attrTitle, e.clientX, e.clientY);
        body.releasePointerCapture(e.pointerId);
        body.removeEventListener("pointermove", handleGlobalPointerMove);
        body.removeEventListener("pointerup", handlePointerUp);
        globalListeners.current = false;
      };
      body.addEventListener("pointerup", handlePointerUp);
    }, [attrTitle, dataSetName, handleDragOver]);
    // Save pointerId in onPointerDown listener. It will be used when a drag actually starts.
    if (listeners) {
      const oldPointerDown = listeners.onPointerDown;
      listeners.onPointerDown = (event: React.PointerEvent<HTMLTableCellElement>) => {
        pointerId.current = event.pointerId;
        oldPointerDown(event);
      };
    }

    useDndMonitor({
      onDragEnd: () => {
        draggingOver.current = null;
      },
      onDragMove: (e) => {
        draggingOver.current = e.over;
      },
      onDragStart: (e) => {
        if (e.active.id === id) {
          dragInCodap();
        }
      }
    });

    const setRef = (element: HTMLTableCellElement) => {
      headerRef.current = element;
      setNodeRef(element);
      setDroppableRef(element);
    };

    return (
      <>
        <th
          ref={setRef}
          data-id={id}
          style={style}
          colSpan={colSpan}
          className={css.draggable}
          { ...attributes }
          { ...listeners }
          onMouseEnter={() => setShowDropdownIcon(true)}
          onMouseLeave={() => setShowDropdownIcon(false)}
          onClick={handleShowHeaderMenu}
        >
          <div className={`${css.thChildContainer} ${isParent ? css.isParent : ""}`}>
            <button
              onMouseEnter={() => setShowDropdownIcon(true)}
              onMouseLeave={() => setShowDropdownIcon(false)}
              onClick={handleShowHeaderMenu}
            >
              {attrId && editableHasFocus
                ? <EditableTableHeader
                    attrId={attrId}
                    collectionName={String(children)}
                    collectionId={collectionId}
                    hasFocus={editableHasFocus}
                    renameAttribute={renameAttribute}
                  />
                : children}
            </button>
            <button className={css.dropdownIcon} onClick={handleShowHeaderMenu}>
              {showDropdownIcon && <DropdownIcon className={css.dropdownIcon} />}
            </button>
          </div>
        </th>
        { showHeaderMenu && tableContainer && headerPos &&
            createPortal(
              <div className={css.headerMenu} ref={headerMenuRef}
                    style={{left: headerPos?.left + 5, top: headerPos?.bottom  + scrollY}}>
                <button onClick={handleDisplayFormulaEditor}>Edit Formula</button>
                <button onClick={() => handleSortAttribute()}>Sort Ascending (A➞Z, 0➞9)</button>
                <button onClick={() => handleSortAttribute(true)}>Sort Descending (Z➞A, 9➞0)</button>
              </div>,
              tableContainer
            )
        }
      </>
    );
});

interface DroppableTableHeaderProps {
  collections: ICollections;
  childCollectionId: number;
  collectionId: number;
  dataSetName: string;
  tableIndex?: number;
  handleAddAttribute: (collection: ICollection, attrName: string, tableIndex: number) => Promise<void>;
}

export const DroppableTableHeader: React.FC<PropsWithChildren<DroppableTableHeaderProps>> =
  observer(function DroppableTableHeader(props) {
    const {childCollectionId, collectionId, collections, children, handleAddAttribute, tableIndex=0} = props;
    const { over } = useDndContext();
    const id = `${collectionId}`;
    const data = { type: "header" };
    const { setNodeRef } = useDroppable({ id, data });
    const style = getStyle(collectionId, undefined, over, "left");

    return (
      <th
        data-id={id}
        ref={setNodeRef}
        style={style}
      >
        <div className={css.parentCollHeader}>
          {children}
          <AddAttributeButton
            collectionId={childCollectionId}
            collections={collections}
            handleAddAttribute={handleAddAttribute}
            tableIndex={tableIndex}
          />
        </div>
      </th>
    );
});

interface DraggableTableDataProps {
  collectionId: number;
  attrTitle: string;
  caseObj: IProcessedCaseObj;
  style?: React.CSSProperties;
  isParent?: boolean;
  parentLevel?: number;
  selectedDataSetName: string;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const DraggableTableData: React.FC<PropsWithChildren<DraggableTableDataProps>> =
  observer(function DraggableTableData(props) {
    const {collectionId, attrTitle, attrTypes, caseObj, isParent, parentLevel=0, precisions, editCaseValue} = props;
    const { dragSide } = useDraggableTableContext();
    const { over } = useDndContext();
    const style = getStyle(collectionId, attrTitle, over, dragSide);
    const {tableScrollTop, scrollY} = useTableTopScrollTopContext();
    const cellValue = caseObj.values.get(attrTitle);

    const cellRef = useRef<HTMLTableCellElement | null>(null);

    const cellTextTop = useMemo (() =>{
      if (!cellRef.current || !isParent) {
        return 0;
      } else {
        const {top, bottom, height} = cellRef.current.getBoundingClientRect();
        const stickyHeaders = tableScrollTop === 0;
        const stickyHeaderHeight = (kMinNumHeaders + parentLevel) * kCellHeight;
        const visibleTop = stickyHeaders ?  Math.max(top, stickyHeaderHeight) : top;
        const visibleBottom = Math.min(window.innerHeight, bottom);
        const availableHeight = Math.abs(visibleBottom - visibleTop);

        let newTop;

        if (top >= visibleTop && bottom <= visibleBottom) { // the whole cell is visible
          return 0;
        } else if (top < visibleTop && bottom < window.innerHeight) {
          // we can see the bottom border of the cell but not the top
          const hiddenHeightOfCell = height - availableHeight;
          newTop = Math.max(0, (hiddenHeightOfCell - kCellHeight + (availableHeight / 2)));
        } else if (top >= visibleTop && bottom > visibleBottom) {
          // we can see the top border of the cell but not the bottom
          newTop = Math.max(0, ((availableHeight) / 2));
        } else {
          // we are in the middle of a cell - we can see neither the top nor the bottom border
          const hiddenTopPartOfCell = Math.max(0, visibleTop - top);
          newTop = Math.max(0, (hiddenTopPartOfCell - kCellHeight + (availableHeight) / 2));
        }
        return newTop;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableScrollTop, isParent, scrollY, parentLevel]);

    const textStyle: React.CSSProperties = {top: cellTextTop};
    if (cellTextTop === 0) {
      textStyle.alignContent = "center";
      textStyle.bottom = 0;
      textStyle.position = "relative";
    } else {
      textStyle.position = "absolute";
    }
    return (
      <td style={style} className={`draggable-table-data ${isParent ? css.parentData : ""}`} ref={cellRef}>
        {isParent
          ? <>
              <span style={{opacity: 0}}>
                {getDisplayValue(cellValue, attrTitle, attrTypes, precisions)}
              </span>
              <div style={textStyle} className={css.cellTextValue}>
                <EditableTableCell
                  attrTitle={attrTitle}
                  case={caseObj}
                  editCaseValue={editCaseValue}
                  precisions={precisions}
                  attrTypes={attrTypes}
                />
              </div>
            </>
          : <EditableTableCell
              attrTitle={attrTitle}
              case={caseObj}
              editCaseValue={editCaseValue}
              precisions={precisions}
              attrTypes={attrTypes}
            />
        }
      </td>
    );
});

interface DroppableTableDataProps {
  collectionId: number;
  style?: React.CSSProperties;
}

export const DroppableTableData: React.FC<PropsWithChildren<DroppableTableDataProps>> =
  observer(function DroppableTableData(props) {
    const {collectionId, style, children} = props;
    const { dragSide } = useDraggableTableContext();
    const { over } = useDndContext();
    const dragStyle = getStyle(collectionId, undefined, over, dragSide);

    return (
      <td style={{...dragStyle, ...style}} className="droppable-table-data">
        {children}
      </td>
    );
});

interface DraggableTableContainerProps {
  caseId?: number;
  collectionId?: number|string;
}

export const DraggableTableContainer: React.FC<PropsWithChildren<DraggableTableContainerProps>> =
  observer(function DraggableTableContainer(props) {
    const { caseId, collectionId: _collectionId, children } = props;
    const collectionId = _collectionId ?? "root";
    const id = `parent:${caseId}:${collectionId}`;
    const data = { type: "collection", collectionId };
    const { setNodeRef } = useDroppable({ id, data });
    const { active, over } = useDndContext();
    const overData = over?.data?.current;
    const hovering = overData && isCollectionData(overData) && overData.collectionId === collectionId;
    const style: React.CSSProperties = {
      display: active ? "table-cell" : "none",
      backgroundColor: hovering ? highlightColor : undefined,
    };

    return (
      <table key={collectionId} className={css.draggableTableContainer}>
        <tbody>
          <tr>
            <td
              className={css.draggableTableContainerDropTarget}
              data-id={id}
              ref={setNodeRef}
              style={style}
            >
              <AddIcon />
              {hovering && <div>Drop to create new collection</div>}
            </td>
            <td className={css.draggableTableContainerChildren}>{children}</td>
          </tr>
        </tbody>
      </table>
    );
});
