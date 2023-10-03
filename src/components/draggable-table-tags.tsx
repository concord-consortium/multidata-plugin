import React from "react";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";

import css from "./tables.scss";

const border = "5px solid #FBF719";
const borderLeft = border;
const borderRight = border;

const getIdAndStyle = (collectionId: number, attrTitle: string, dragOverId?: string, dragSide?: Side)
  : {id: string, style: React.CSSProperties} => {
  const id = `${collectionId}-${attrTitle}`;
  return {
    id,
    style: id === dragOverId ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {}
  };
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
      onDragEnd={handleDragEnd}
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
}

export const DraggagleTableData: React.FC<DraggagleTableDataProps> = ({collectionId, attrTitle, children}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const {id, style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);

  return (
    <td data-id={id} style={style}>
      {children}
    </td>
  );
};

