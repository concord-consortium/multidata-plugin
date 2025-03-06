import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Box, Text, Textarea } from "@chakra-ui/react";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { IProcessedCaseObj, ISelectedCase } from "../../../types";
import { getDisplayValue } from "../../../utils/utils";

import css from "./editable-table-cell.scss";

interface IProps {
  attrTitle: string;
  case: IProcessedCaseObj;
  editCaseValue: (newValue: string, cCase: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  onSelectCase?: (caseId: number | number[], e: React.MouseEvent<HTMLDivElement>) => void;
  selectionList?: ISelectedCase[];
}

export const EditableTableCell = observer(function EditableTableCell(props: IProps) {
  const { attrTitle, case: cCase, editCaseValue, attrTypes, precisions, onSelectCase, selectionList } = props;
  const cellValue = cCase.values.get(attrTitle);
  const displayValue = getDisplayValue(cellValue, attrTitle, attrTypes, precisions);
  const [editingValue, setEditingValue] = useState(displayValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleChangeValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingValue(e.target.value);
  };

  const handleCancel = () => {
    setEditingValue(displayValue);
    setIsEditing(false);
  };

  const handleSubmit = async (newValue: string) => {
    if (newValue === displayValue) {
      setIsEditing(false);
      return;
    }

    try {
      await editCaseValue(newValue, cCase, attrTitle);
      setIsEditing(false);
    } catch (e) {
      console.error("Case not updated: ", e);
    }
  };

  const handleCellClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isEditing) return;
    const isExtending = e.altKey || e.metaKey;
    const selectedCasesIdsArray = selectionList?.map(sCase => sCase.caseID);
    const selectCasesArray = isExtending && selectedCasesIdsArray
            ? [...selectedCasesIdsArray, cCase.id]
            : [cCase.id];
    selectCasesArray && onSelectCase?.(selectCasesArray, e);
    setIsEditing(false);
  };

  const handleStartEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleSubmit((e.target as HTMLTextAreaElement).value);
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className={css.editableTableCell}>
      <Box onClick={handleCellClick} position="relative" height="100%" width="100%">
        {isEditing
          ? <Textarea
              className={css.editableInput}
              value={editingValue}
              onChange={(e) => handleChangeValue(e)}
              onBlur={(e) => handleSubmit(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
        : <Text onDoubleClick={handleStartEdit} cursor="pointer">
            {displayValue}
          </Text>
        }
      </Box>
    </div>
  );
});
