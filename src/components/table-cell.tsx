import React from "react";
import { DraggagleTableData } from "./draggable-table-tags";

interface ITableCellProps {
  key: string;
  index: number;
  collectionId: number;
  rowKey: string;
  caseId: string;
  attributeName: string;
  cellValue: any;
  precision: number;
  attrType?: string|null;
  isHidden: boolean;
  isParent?: boolean;
  resizeCounter?: number;
  parentLevel?: number;
}

export const TableCell: React.FC<ITableCellProps> = (props) => {
  const {
    collectionId,
    index,
    rowKey,
    caseId,
    attributeName,
    cellValue,
    precision,
    attrType,
    isHidden,
    isParent,
    resizeCounter,
    parentLevel,
  } = props;

  if (attributeName === "id" || (typeof cellValue !== "string" && typeof cellValue !== "number") || isHidden ) {
    return null;
  }

  let displayValue: string|number;
  const isNumericType= attrType === "numeric";
  const hasValue= cellValue !== "";
  const parsedValue: number = typeof cellValue === "string" ? parseFloat(cellValue) : NaN;
  const isNumber= !isNaN(parsedValue);
  const hasPrecision= precision !== undefined;
  const defaultValue: string | number = cellValue;
  const isNumberType= typeof cellValue === "number";

  if (isNumericType && hasValue && isNumber) {
    const cellValAsNumber = Number(cellValue);
    const isWholeNumber: boolean = cellValAsNumber % 1 === 0;
    displayValue = isWholeNumber
      ? parseInt(cellValue as string, 10)
      : parsedValue.toFixed(hasPrecision ? precision : 2);
  } else if (!isNumericType && isNumberType && hasValue) {
    displayValue = (cellValue as number).toFixed(hasPrecision ? precision : 2);
  } else {
    displayValue = defaultValue;
  }

  return (
    <DraggagleTableData
      collectionId={collectionId}
      attrTitle={attributeName}
      key={`${rowKey}-${cellValue}-${attributeName}-${index}}`}
      isParent={isParent}
      caseId={caseId}
      resizeCounter={resizeCounter}
      parentLevel={parentLevel}
    >
      {displayValue}
    </DraggagleTableData>
  );
};

