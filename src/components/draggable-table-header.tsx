import React from "react";
import { useDraggableTableContext } from "../hooks/useDraggableTable";

const border = "3px solid #FBF719";
const borderLeft = border;
const borderRight = border;

interface DraggagleTableHeaderProps {
  collectionId: number;
  attrTitle: string;
  colSpan?: number;
}

export const DraggagleTableHeader: React.FC<DraggagleTableHeaderProps> = ({collectionId, attrTitle, children}) => {
  const {dragOverId, dragSide, handleDragStart, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave} = useDraggableTableContext();
  const id = `${collectionId}-${attrTitle}`;
  const style: React.CSSProperties = id === dragOverId ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {};

  return (
    <th
      data-id={id}
      style={style}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {children}
    </th>
  );
};
