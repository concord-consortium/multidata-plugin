import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react-lite";
import { getAttribute, IResult } from "@concord-consortium/codap-plugin-api";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";
import { useTableTopScrollTopContext } from "../hooks/useTableScrollTop";
import { getCollectionById } from "../utils/apiHelpers";
import { ICollection, ICollections, IProcessedCaseObj, PropsWithChildren } from "../types";
import { EditableTableCell } from "./editable-table-cell";
import { AddAttributeButton } from "./add-attribute-button";
import { EditableTableHeader } from "./editable-table-header";

import AddIcon from "../assets/plus-level-1.svg";
import DropdownIcon from "../assets/dropdown-arrow-icon.svg";

import css from "./tables.scss";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;
const kCellHeight = 16;
const kMinNumHeaders = 3;

const getStyle = (id: string, dragOverId?: string, dragSide?: Side) => {
  return id === dragOverId ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {};
};

const getIdAndStyle = (collectionId: number, attrTitle: string, dragOverId?: string, dragSide?: Side)
  : {id: string, style: React.CSSProperties} => {
  const id = `${collectionId}-${attrTitle}`;
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
  editableHasFocus?: boolean;
  attrId?: number;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export const DraggableTableHeader: React.FC<PropsWithChildren<DraggagleTableHeaderProps>> =
  observer(function DraggagleTableHeader(props) {
    const {collectionId, attrTitle, dataSetName, editableHasFocus, children, handleSortAttribute,
           isParent, attrId, renameAttribute} = props;
    const {dragOverId, dragSide, handleDragStart, handleDragOver, handleOnDrop, handleDragEnter,
      handleDragLeave, handleDragEnd} = useDraggableTableContext();
    const {id, style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);
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

    const handleShowHeaderMenu = (e: React.MouseEvent<HTMLTableCellElement | HTMLButtonElement>) => {
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

    return (
      <>
        <th
          ref={headerRef}
          data-id={id}
          style={style}
          draggable={true}
          className={css.draggable}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleOnDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
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
  collections: ICollections;
  childCollectionId: number;
  collectionId: number;
  dataSetName: string;
  handleAddAttribute: (collection: ICollection, attrName: string) => Promise<void>;
}

export const DroppableTableHeader: React.FC<PropsWithChildren<DroppableTableHeaderProps>> =
  observer(function DroppableTableHeader(props) {
    const {childCollectionId, collectionId, collections, children, handleAddAttribute} = props;
    const {dragOverId, handleDragOver, handleOnDrop, handleDragEnter, handleDragLeave} = useDraggableTableContext();
    const id = `${collectionId}`;
    const style = getStyle(id, dragOverId, "left");

    return (
      <th
        data-id={id}
        style={style}
        onDragOver={handleDragOver}
        onDrop={handleOnDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className={css.parentCollHeader}>
          {children}
          <AddAttributeButton
            collectionId={childCollectionId}
            collections={collections}
            handleAddAttribute={handleAddAttribute}
          />
        </div>
      </th>
    );
});

interface DraggagleTableDataProps {
  collectionId: number;
  attrTitle: string;
  caseObj: IProcessedCaseObj;
  style?: React.CSSProperties;
  isParent?: boolean;
  parentLevel?: number;
  selectedDataSetName: string;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const DraggagleTableData: React.FC<PropsWithChildren<DraggagleTableDataProps>> =
  observer(function DraggagleTableData(props) {
    const {collectionId, attrTitle, children, caseObj, isParent, parentLevel=0, editCaseValue} = props;
    const {dragOverId, dragSide} = useDraggableTableContext();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableScrollTop, isParent, scrollY, parentLevel]);

    const EditableCell = () => {
      return (
        <EditableTableCell
          attrTitle={attrTitle}
          case={caseObj}
          editCaseValue={editCaseValue}
        />
      );
    };

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
    const {dragOverId, dragSide} = useDraggableTableContext();
    const dragStyle = getStyle(`${collectionId}`, dragOverId, dragSide);

    return (
      <td style={{...dragStyle, ...style}} className="droppable-table-data">
        {children}
      </td>
    );
});

interface DraggableTableContainerProps {
  collectionId?: number|string;
}

export const DraggableTableContainer: React.FC<PropsWithChildren<DraggableTableContainerProps>> =
  observer(function DraggableTableContainer(props) {
    const {collectionId, children} = props;
    const {dragging, dragOverId, handleDragOver, handleOnDrop, handleDragEnter,
           handleDragLeave} = useDraggableTableContext();
    const id = collectionId ? `parent:${collectionId}` : `parent:root`;
    const hovering = id === dragOverId;
    const style: React.CSSProperties = {
      display: dragging ? "table-cell" : "none",
      backgroundColor: hovering ? highlightColor : undefined,
    };

    return (
      <table key={collectionId} className={css.draggableTableContainer}>
        <tbody>
          <tr>
            <td
              className={css.draggableTableContainerDropTarget}
              data-id={id}
              style={style}
              onDragOver={handleDragOver}
              onDrop={handleOnDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
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
