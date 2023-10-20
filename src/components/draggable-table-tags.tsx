import React, { useEffect, useRef, useState } from "react";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";

import AddIcon from "../assets/plus-level-1.svg";

import css from "./tables.scss";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;
const kCellHeight = 16;
// const headerHeight = kCellHeight * 3;

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
  scrollTop?: number;
  idx?: null|number;
  menuHeight?: number;
}

export const DraggagleTableData: React.FC<DraggagleTableDataProps>
                = ({collectionId, attrTitle, children, isParent, scrollTop=0, idx=0, menuHeight=29}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const {style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);
  const cellRef = useRef<HTMLTableDataCellElement>(null);
  const cellValueRef = useRef<HTMLDivElement>(null);
  const [textTopPosition, setTextTopPosition] = useState(0);
  const [cellEnded, setCellEnded] = useState(false);
  const [scrollT, setScrollT] = useState(0);
  const headerIndexCount = idx !== null ? idx : 0;
  const headerHeight = (kCellHeight * (3+headerIndexCount));

  useEffect(() => {
    const cellRect = cellRef.current?.getBoundingClientRect();
    const cellTextValue = cellValueRef.current?.textContent;
    // const scrollValue = scrollTop;
    const cellPosition = cellRef.current?.offsetTop;

    if (cellRect) {
      const cellHeight = cellRect.height;
      const cellTop = cellRect.top;
      // const scrollValue = scrollTop + window.innerHeight - cellTop;
      // const scrollValue = scrollTop <= headerHeight ? 0 : scrollTop - headerHeight;
      const scrollValue = scrollTop;

      // const scrollValue = scrollT;
      const isWholeCellVisible = cellTop + cellHeight < window.innerHeight && cellTop >= headerHeight;
      //both top and bottom are not visible
      const isInCellMiddle = cellTop < headerHeight && cellTop + cellHeight > window.innerHeight;
      // const visibleHeight = cellHeight - cellTop - headerHeight;
      console.log(cellTextValue, "headerHeight", headerHeight);
      console.log(cellTextValue, "scrollTop", scrollTop);
      console.log(cellTextValue, "cellHeight", cellHeight);
      console.log(cellTextValue, "cellTop", cellTop);
      console.log(cellTextValue, "cellPosition", cellPosition);
      // console.log(cellTextValue, "visibleHeight", visibleHeight);
      console.log(cellTextValue, "scrollValue", scrollValue, "window.innerHeight", window.innerHeight);
      if (cellHeight < window.innerHeight && isWholeCellVisible) { //center text if whole cell is visible
        console.log(cellTextValue, "WHOLE cell is visible");
        setTextTopPosition(0);
      } else {
        // what part of the cell is visible?
        console.log(cellTextValue, "TOP logic", cellTop < window.innerHeight, cellTop >= headerHeight);
        console.log(cellTextValue, "BOTTOM logic", cellHeight <= window.innerHeight);

        if (cellTop < window.innerHeight && cellTop >= headerHeight) {
          // we see the top of the cell
          console.log(cellTextValue, "we are at the TOP");
          setTextTopPosition(Math.max(-cellHeight/2 + kCellHeight, -cellHeight/2 + kCellHeight + scrollValue));
        }
        else
        // if (cellTop < 0 && cellTop - kCellHeight + cellHeight/2 < window.innerHeight) {
        if (cellHeight <= window.innerHeight) {
          // we see the bottom of the cell
          console.log(cellTextValue, "we are at the BOTTOM");
          // setTextTopPosition(cellHeight/2 - kCellHeight);
          setTextTopPosition(Math.min(scrollValue - cellHeight/2 - kCellHeight,
                                        cellHeight/2 - kCellHeight));
        } else
        if (isInCellMiddle) {
          console.log("in the MIDDLE");
        }
        else {
          console.log(cellTextValue, "IDK");
          setTextTopPosition(0 + scrollValue);
        }
      }
      // if (cellTop + cellHeight < window.innerHeight) {
      //   // we are showing next cell
      //   console.log(cellTextValue, "SHOWING NEXT CELL");
      //   setCellEnded(true);
      // }
    }
    console.log(cellTextValue, "textTopPosition", textTopPosition, cellEnded);
  },[cellEnded, scrollTop, textTopPosition]);

  return (
    <td style={style} className={`draggable-table-data ${isParent ? "parent-data" : ""}`} ref={cellRef}>
      {isParent
        ? <div className="data-text-value" style={{position: "relative", top: textTopPosition}} ref={cellValueRef}>
            {children}
          </div>
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


