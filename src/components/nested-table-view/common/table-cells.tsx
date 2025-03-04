import React from "react";
import { IProcessedCaseObj } from "../../../types";
import { DraggableTableData } from "./draggable-table-tags";
import { IResult } from "@concord-consortium/codap-plugin-api";

interface IProps {
  collectionId: number;
  rowKey: string;
  cCase: IProcessedCaseObj;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  attrVisibilities: Record<string, boolean>;
  isParent?: boolean;
  parentLevel?: number;
  selectedDataSetName: string;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const TableCells = (props: IProps) => {
  const { collectionId, rowKey, cCase, precisions, attrTypes, attrVisibilities, isParent, parentLevel,
    selectedDataSetName, editCaseValue } = props;
  if (!selectedDataSetName) return null;
  const aCase = cCase.values;
  return (
    <>
      {[...aCase.keys()].map((key, index) => {
        const cellValue = aCase.get(key);
        const isHidden = attrVisibilities[key];
        if (key === "id" || (typeof cellValue !== "string" && typeof cellValue !== "number") || isHidden ) {
          return null;
        }

        return (
          <DraggableTableData
            collectionId={collectionId}
            attrTitle={String(key)}
            key={`${rowKey}-${cellValue}-${index}}`}
            isParent={isParent}
            caseObj={cCase}
            precisions={precisions}
            attrTypes={attrTypes}
            parentLevel={parentLevel}
            selectedDataSetName={selectedDataSetName}
            editCaseValue={editCaseValue}
          />
        );
      })}
    </>
  );
};
