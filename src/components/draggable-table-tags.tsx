import React, { useMemo, useRef } from "react";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";

import AddIcon from "../assets/plus-level-1.svg";

import css from "./tables.scss";
import { useTableTopScrollTopContext } from "../hooks/useTableScrollTop";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;

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
}

export const DraggagleTableHeader: React.FC<DraggagleTableHeaderProps> = ({collectionId, attrTitle, children}) => {
  const {dragOverId, dragSide, handleDragStart, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave, handleDragEnd} = useDraggableTableContext();
  const {id, style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);

  return (
    <th
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
    >
      {children}
    </th>
  );
};

interface DroppableTableHeaderProps {
  collectionId: number;
}

export const DroppableTableHeader: React.FC<DroppableTableHeaderProps> = ({collectionId, children}) => {
  const {dragOverId, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave} = useDraggableTableContext();

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
      {children}
    </th>
  );
};

interface DraggagleTableDataProps {
  collectionId: number;
  attrTitle: string;
  style?: React.CSSProperties;
  isParent?: boolean;
}

export const DraggagleTableData: React.FC<DraggagleTableDataProps>
                = ({collectionId, attrTitle, children, isParent}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const {style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);
  const {tableScrollTop, scrollY} = useTableTopScrollTopContext();

  const cellRef = useRef<HTMLTableCellElement | null>(null);

  // HACK!!!
  let level = 0;
  if (cellRef.current) {
    let walker: HTMLElement|null = cellRef.current;
    while (walker && !walker.classList.contains("tables-portraitTable")) {
      if (walker.tagName === "TABLE") {
        level++;
      }
      walker = walker.parentElement;
    }
  }
  level = level / 2;

  const cellTextTop = useMemo (() =>{
    if (!cellRef.current || !isParent) {
      return 0;
    } else {
      const {top, bottom, height} = cellRef.current.getBoundingClientRect();
      const stickyHeaders = tableScrollTop === 0;
      const stickyHeaderHeight = (3 + level) * 16;
      const visibleTop = stickyHeaders ?  Math.max(top, stickyHeaderHeight) : top;
      // const visibleTop = stickyHeaders ?  Math.max(top, (stickyHeaderHeight + scrollY)) : tableScrollTop;
      // const visibleBottom = Math.min(window.innerHeight, Math.max(bottom, 0));
      const visibleBottom = Math.min(window.innerHeight, bottom);
      const text = cellRef.current.innerText;
      const availableHeight = Math.abs(visibleBottom - visibleTop);

      let newTop;

      if (top >= visibleTop && bottom <= visibleBottom) {
        // the whole cell is visible
        return 0;
      } else if (top < visibleTop && bottom < window.innerHeight) {
        // we are in the bottom part of the cell
        const hiddenHeightOfCell = height - availableHeight;
        newTop = Math.max(0, (hiddenHeightOfCell - 16 + (availableHeight / 2))) /* + height of text */;
      } else if (top >= visibleTop && bottom > visibleBottom) {
        // we are in the top part of the cell
        newTop = Math.max(0, ((availableHeight) / 2)) /* + height of text */;
      } else {
        // we are in the middle of a cell that's taller than the table window
        // we need to get the hidden top part of the cell
        const hiddenTopPartOfCell = Math.max(0, visibleTop - top);
        newTop = Math.max(0, (hiddenTopPartOfCell - 16 + (availableHeight) / 2)) /* + height of text */;
      }

      console.log(cellRef.current?.innerText, JSON.stringify({top, bottom, visibleBottom,
        tableScrollTop, visibleTop, availableHeight, newTop, scrollY}));
      return newTop;
    }


  }, [tableScrollTop, isParent, scrollY, level]);

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
            <div style={textStyle } className={css.cellTextValue}>{children}</div>
          </>
        : children
      }
    </td>
  );
};

interface DroppableTableDataProps {
  collectionId: number;
  style?: React.CSSProperties;
}

export const DroppableTableData: React.FC<DroppableTableDataProps> = ({collectionId, style, children}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const dragStyle = getStyle(`${collectionId}`, dragOverId, dragSide);

  return (
    <td style={{...dragStyle, ...style}} className="droppable-table-data">
      {children}
    </td>
  );
};

interface DraggableTableContainerProps {
  collectionId?: number|string;
}

export const DraggableTableContainer: React.FC<DraggableTableContainerProps> = ({collectionId, children}) => {
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
};


