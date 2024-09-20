import React from "react";
import { observer } from "mobx-react-lite";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { DraggagleTableData } from "./draggable-table-tags";
import { IProcessedCaseObj } from "../types";

interface IProps {
  key: string;
  index: number;
  collectionId: number;
  rowKey: string;
  caseObj: IProcessedCaseObj;
  attributeName: string;
  cellValue: any;
  precision: number;
  attrType?: string|null;
  isHidden: boolean;
  isParent?: boolean;
  selectedDataSet: string;
  parentLevel?: number;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const TableCell: React.FC<IProps> = observer(function TableCell(props) {
  const { attributeName, cellValue, precision, attrType, isHidden, isParent, selectedDataSet,
          collectionId, rowKey, caseObj, parentLevel, index, editCaseValue } = props;

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
      selectedDataSetName={selectedDataSet}
      collectionId={collectionId}
      attrTitle={attributeName}
      key={`${rowKey}-${cellValue}-${attributeName}-${index}}`}
      isParent={isParent}
      caseObj={caseObj}
      parentLevel={parentLevel}
      editCaseValue={editCaseValue}
    >
      {displayValue}
    </DraggagleTableData>
  );
});
