import React from "react";
import { DraggagleTableHeader } from "./draggable-table-tags";
import { IDataSet, Values } from "../types";

interface MapHeadersFromValuesProps {
  collectionId: number;
  rowKey: string;
  values: Values;
  attrVisibilities: Record<string, boolean>;
  isParent?: boolean;
  attrId?: number;
  editableHasFocus?: boolean;
  selectedDataSet: IDataSet;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export const TableHeaders: React.FC<MapHeadersFromValuesProps> = ({
  collectionId,
  rowKey,
  values,
  attrVisibilities,
  isParent,
  attrId,
  editableHasFocus,
  selectedDataSet,
  renameAttribute
}) => {
  return (
    <>
      {Object.keys(values).map((key, index) => {
        if (!attrVisibilities[key] && (typeof values[key] === "string" || typeof values[key] === "number")) {
          return (
            <DraggagleTableHeader
              key={`${collectionId}-${rowKey}-${key}-${index}`}
              collectionId={collectionId}
              attrTitle={key}
              dataSetName={selectedDataSet.name}
              dataSetTitle={selectedDataSet.title}
              isParent={isParent}
              attrId={attrId}
              editableHasFocus={editableHasFocus && index === Object.keys(values).length - 1}
              renameAttribute={renameAttribute}
            >
              {key}
            </DraggagleTableHeader>
          );
        }
        return null;
      })}
    </>
  );
};
