import React, { ReactNode, useState } from "react";
import { Editable, EditablePreview, EditableInput } from "@chakra-ui/react";
import { useCodapState } from "../hooks/useCodapState";

import css from "./editable-table-cell.scss";

interface IProps {
  attrTitle: string;
  caseId: string;
  children: ReactNode;
  selectedDataSetName: string;
}

export const EditableTableCell = (props: IProps) => {
  const { attrTitle, caseId, children } = props;
  const { editCaseValue } = useCodapState();
  const [displayValue, setDisplayValue] = useState(String(children));
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
      await editCaseValue(newValue, caseId, attrTitle);
      setDisplayValue(newValue);
      setEditingValue(newValue);
      setIsEditing(false);
    } catch (e) {
      console.error("Case not updated: ", e);
    }
  };

  return (
    <div className={css.editableTableCell}>
      <Editable
        isPreviewFocusable={true}
        onCancel={handleCancel}
        onChange={handleChangeValue}
        onEdit={() => setIsEditing(true)}
        onSubmit={handleSubmit}
        submitOnBlur={true}
        value={isEditing ? editingValue : displayValue}
      >
        {!isEditing && <EditablePreview />}
        <EditableInput />
      </Editable>
    </div>
  );
};