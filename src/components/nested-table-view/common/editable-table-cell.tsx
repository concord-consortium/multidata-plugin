import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Editable, EditablePreview, EditableInput, Input } from "@chakra-ui/react";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { IProcessedCaseObj } from "../../../types";
import { getDisplayValue } from "../../../utils/utils";

import css from "./editable-table-cell.scss";

interface IProps {
  attrTitle: string;
  case: IProcessedCaseObj;
  editCaseValue: (newValue: string, cCase: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  onSelectCase?: (caseId: number, e: React.MouseEvent<HTMLDivElement>) => void;
}

export const EditableTableCell = observer(function EditableTableCell(props: IProps) {
  const { attrTitle, case: cCase, editCaseValue, attrTypes, precisions, onSelectCase } = props;
  const cellValue = cCase.values.get(attrTitle);
  const displayValue = getDisplayValue(cellValue, attrTitle, attrTypes, precisions);
  const [editingValue, setEditingValue] = useState(displayValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleChangeValue = (newValue: string) => {
    setEditingValue(newValue);
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
    onSelectCase?.(cCase.id, e);
    setIsEditing(false);
  };

  const handleStartEdit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsEditing(true);
  };
console.log("isEditing", isEditing);
  return (
    <div className={css.editableTableCell}>
      <Editable
        isPreviewFocusable={true}
        onCancel={handleCancel}
        onChange={handleChangeValue}
        onEdit={() => setIsEditing(true)}
        onDoubleClick={handleStartEdit}
        onSubmit={handleSubmit}
        submitOnBlur={true}
        value={isEditing ? editingValue : displayValue}
        onClick={(e)=>handleCellClick(e)}
      >
        {!isEditing && <EditablePreview
                  onClick={(e) => handleCellClick(e)}
                  onDoubleClick={(e) => handleStartEdit(e)}/>}
        <EditableInput />
      </Editable>
    </div>
  );
});
