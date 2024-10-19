import { Over, useDndContext, useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react-lite";
import { getAttribute, IResult } from "@concord-consortium/codap-plugin-api";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";
import { useTableTopScrollTopContext } from "../hooks/useTableScrollTop";
import { endCodapDrag, getCollectionById, moveCodapDrag, startCodapDrag } from "../utils/apiHelpers";
import { IProcessedCaseObj, isCollectionData, PropsWithChildren } from "../types";
import { EditableTableCell } from "./editable-table-cell";

import AddIcon from "../assets/plus-level-1.svg";
import DropdownIcon from "../assets/dropdown-arrow-icon.svg";

import css from "./tables.scss";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;
const kCellHeight = 16;
const kMinNumHeaders = 3;

function getId(collectionId: number, attrTitle: string) {
  return `${collectionId}-${attrTitle}`;
}

const getStyle = (id: string, dragOverId?: string, dragSide?: Side) => {
  return id === dragOverId ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {};
};

const getIdAndStyle = (collectionId: number, attrTitle: string, dragOverId?: string, dragSide?: Side)
  : {id: string, style: React.CSSProperties} => {
  const id = getId(collectionId, attrTitle);
  const style = getStyle(id, dragOverId, dragSide);
  return { id, style };
};

interface DraggagleTableHeaderProps {
  collectionId: number;
  attrTitle: string;
  colSpan?: number;
  dataSetName: string;
  dataSetTitle: string;
  handleSortAttribute: (dataSetName: string, attributeId: number, isDescending: boolean) => void;
  isParent?: boolean;
}

export const DraggableTableHeader: React.FC<PropsWithChildren<DraggagleTableHeaderProps>> =
  observer(function DraggagleTableHeader(props) {
    const {collectionId, attrTitle, dataSetName, children, handleSortAttribute} = props;
    const { dragSide, handleDragOver } = useDraggableTableContext();
    const draggingOver = useRef<Over|null>();
    const id = getId(collectionId, attrTitle);
    const data = { type: "attribute", collectionId, attrTitle };
    const { over, setNodeRef: setDroppableRef } = useDroppable({ id, data });
    const dragOverId = over ? `${over.id}` : undefined;
    const baseStyle = getStyle(id, dragOverId, dragSide);
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data });
    const style = { ...baseStyle, ...transform };
    const headerRef = useRef<HTMLTableCellElement | null>(null);
    const [showDropdownIcon, setShowDropdownIcon] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const headerPos = headerRef.current?.getBoundingClientRect();
    const headerMenuRef = useRef<HTMLDivElement | null>(null);
    const tableContainer = document.querySelector(".nested-table-nestedTableWrapper");

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
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

    const handleShowHeaderMenu = (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowHeaderMenu(!showHeaderMenu);
    };

    const handleSortAttr = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const isDescending = e.target.value === "desc";
      const collectionName = await getCollectionById(dataSetName, collectionId);
      const attribute = (await getAttribute(dataSetName, collectionName, attrTitle)).values;
      handleSortAttribute(dataSetName, attribute.id, isDescending);
      setShowHeaderMenu(false);
    };

    // Manage synthetic drag in Codap via API requests
    const globalListeners = useRef(false); // True if the global drag listeners have already been set up.
    const dragInCodap = useCallback((pointerId: number) => {
      // Bail if we have already set up global listeners
      if (globalListeners.current) return;

      // Listen for pointer events everywhere, even outside the plugin
      globalListeners.current = true;
      const { body } = document;
      body.setPointerCapture(pointerId);

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
    // Add Codap drag to dnd-kit onPointerDown listener
    if (listeners) {
      const oldPointerDown = listeners.onPointerDown;
      listeners.onPointerDown = (event: React.PointerEvent<HTMLTableCellElement>) => {
        dragInCodap(event.pointerId);
        oldPointerDown(event);
      };
    }

    useDndMonitor({
      onDragEnd: () => {
        draggingOver.current = null;
      },
      onDragMove: (e) => {
        draggingOver.current = e.over;
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
          className={css.draggable}
          { ...attributes }
          { ...listeners }
          onMouseEnter={() => setShowDropdownIcon(true)}
          onMouseLeave={() => setShowDropdownIcon(false)}
          onClick={handleShowHeaderMenu}
        >
          <div className={css.thChildContainer}>
            <div>{children}</div>
            {showDropdownIcon &&
              <div className={css.dropdownIcon}>
                <DropdownIcon
                  onClick={handleShowHeaderMenu}
                  className={css.dropdownIcon}
                />
              </div>
            }
          </div>
        </th>
        { showHeaderMenu && tableContainer && headerPos &&
            createPortal(
              <div className={css.headerMenu} ref={headerMenuRef}
                    style={{left: headerPos?.left + 5, top: headerPos?.bottom  + scrollY}}>
                  <select className={css.headerMenuSelect} size={2} onChange={handleSortAttr}>
                      <option value="asc">Sort Ascending (A➞Z, 0➞9)</option>
                      <option value="desc">Sort Descending (Z➞A, 9➞0)</option>
                  </select>
              </div>,
              tableContainer
            )
        }
      </>
    );
});

interface DroppableTableHeaderProps {
  collectionId: number;
}

export const DroppableTableHeader: React.FC<PropsWithChildren<DroppableTableHeaderProps>> =
  observer(function DroppableTableHeader(props) {
    const {collectionId, children} = props;
    const { over } = useDndContext();
    const dragOverId = over ? `${over.id}` : undefined;
    const id = `${collectionId}`;
    const data = { type: "header" };
    const { setNodeRef } = useDroppable({ id, data });
    const style = getStyle(id, dragOverId, "left");

    return (
      <th
        data-id={id}
        ref={setNodeRef}
        style={style}
      >
        {children}
      </th>
    );
});

interface DraggagleTableDataProps {
  collectionId: number;
  attrTitle: string;
  caseObj: IProcessedCaseObj;
  style?: React.CSSProperties;
  isParent?: boolean;
  resizeCounter?: number;
  parentLevel?: number;
  selectedDataSetName: string;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const DraggagleTableData: React.FC<PropsWithChildren<DraggagleTableDataProps>> =
  observer(function DraggagleTableData(props) {
    const {collectionId, attrTitle, children, caseObj, isParent, resizeCounter, parentLevel=0, editCaseValue} = props;
    const { dragSide } = useDraggableTableContext();
    const { over } = useDndContext();
    const dragOverId = over ? `${over.id}` : undefined;
    const {style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);
    const {tableScrollTop, scrollY} = useTableTopScrollTopContext();

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
    // resizeCounter is a hack to force rerender of text positioning when window is resized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableScrollTop, isParent, scrollY, parentLevel, resizeCounter]);

    const EditableCell = useCallback(() => {
      return (
        <EditableTableCell
          attrTitle={attrTitle}
          case={caseObj}
          editCaseValue={editCaseValue}
        />
      );
    }, [attrTitle, caseObj, editCaseValue]);

    const textStyle: React.CSSProperties = {top: cellTextTop};
    if (cellTextTop === 0) {
      textStyle.alignContent = "center";
      textStyle.bottom = 0;
    }
    return (
      <td style={style} className={`draggable-table-data ${isParent ? css.parentData : ""}`} ref={cellRef}>
        {isParent
          ? <>
              <span style={{opacity: 0}}>{children}</span>
              <div style={textStyle} className={css.cellTextValue}>
                <EditableCell />
              </div>
            </>
          : <EditableCell />
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
    const dragOverId = over ? `${over.id}` : undefined;
    const dragStyle = getStyle(`${collectionId}`, dragOverId, dragSide);

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
    const { active, over } = useDndContext();
    const collectionId = _collectionId ?? "root";
    const id = `parent:${caseId}:${collectionId}`;
    const data = { type: "collection", collectionId };
    const { setNodeRef } = useDroppable({ id, data });
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
