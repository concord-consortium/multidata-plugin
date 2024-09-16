import React from "react";
import { IDataSet, Values } from "../types";
import { DraggagleTableData } from "./draggable-table-tags";

export type MapCellsFromValuesProps = {
  collectionId: number;
  rowKey: string;
  aCase: Values;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  attrVisibilities: Record<string, boolean>;
  isParent?: boolean;
  resizeCounter?: number;
  parentLevel?: number;
};

export const TableCells: React.FC<MapCellsFromValuesProps> = ({
  collectionId,
  rowKey,
  aCase,
  precisions,
  attrTypes,
  attrVisibilities,
  isParent,
  resizeCounter,
  parentLevel,
}) => {
  return (
    <>
      {Object.keys(aCase).map((key, index) => {
        if (key === "id") return null;

        const isWholeNumber = aCase[key] % 1 === 0;
        const precision = precisions[key];
        const isNumericType = attrTypes[key] === "numeric";
        const hasValue = aCase[key] !== "";
        const parsedValue = parseFloat(aCase[key]);
        const isNumber = !isNaN(parsedValue);
        const hasPrecision = precision !== undefined;
        const defaultValue = aCase[key];
        const isNumberType = typeof aCase[key] === "number";
        let val;

        if (isNumericType && hasValue && isNumber) {
          val = isWholeNumber ? parseInt(aCase[key], 10) : parsedValue.toFixed(hasPrecision ? precision : 2);
        } else if (!isNumericType && isNumberType && hasValue) {
          val = defaultValue.toFixed(hasPrecision ? precision : 2);
        } else {
          val = defaultValue;
        }

        if (attrVisibilities[key]) {
          return null;
        }
        if (typeof val === "string" || typeof val === "number") {
          return (
            <DraggagleTableData
              collectionId={collectionId}
              attrTitle={key}
              key={`${rowKey}-${val}-${index}}`}
              isParent={isParent}
              caseId={aCase.id}
              resizeCounter={resizeCounter}
              parentLevel={parentLevel}
            >
              {val}
            </DraggagleTableData>
          );
        }
      })}
    </>
  );
};
