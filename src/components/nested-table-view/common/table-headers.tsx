import React from "react";
import { DraggableTableHeader } from "./draggable-table-tags";
import { IDataSet, Values } from "../../../types";
import { isNewAttribute } from "../../../utils/utils";

interface ITableHeaders {
  collectionId: number;
  rowKey: string;
  values: Values;
  attrVisibilities: Record<string, boolean>;
  isParent?: boolean;
  attrId?: number;
  editableHasFocus?: boolean;
  selectedDataSet: IDataSet;
  handleSortAttribute: (dataSetName: string, attributeId: number, isDescending: boolean) => void;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export const TableHeaders: React.FC<ITableHeaders> = ({
  collectionId,
  rowKey,
  values,
  attrVisibilities,
  isParent,
  attrId,
  editableHasFocus,
  selectedDataSet,
  handleSortAttribute,
  renameAttribute
}) => {
  const caseValuesKeys = [...values.keys()];
  return (
    <>
      {caseValuesKeys.map((key, index) => {
        if (!attrVisibilities[key] && (typeof values.get(key) === "string" || typeof values.get(key) === "number")) {
          const isEditable = isNewAttribute(key, index, caseValuesKeys);
          return (
            <DraggableTableHeader
              key={`${collectionId}-${rowKey}-${key}-${index}`}
              collectionId={collectionId}
              attrTitle={String(key)}
              dataSetName={selectedDataSet.name}
              dataSetTitle={selectedDataSet.title}
              isParent={isParent}
              attrId={attrId}
              editableHasFocus={editableHasFocus && isEditable}
              renameAttribute={renameAttribute}
              handleSortAttribute={handleSortAttribute}
            >
              {key}
            </DraggableTableHeader>
          );
        }
        return null;
      })}
    </>
  );
};
