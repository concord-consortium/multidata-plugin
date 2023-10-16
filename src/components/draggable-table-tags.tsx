import React from "react";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";

import AddIcon from "../assets/plus-level-1.svg";

import css from "./tables.scss";

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
}

export const DraggagleTableData: React.FC<DraggagleTableDataProps> = ({collectionId, attrTitle, children}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const {style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);

  return (
    <td style={style}>
      {children}
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
    <td style={{...dragStyle, ...style}}>
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


