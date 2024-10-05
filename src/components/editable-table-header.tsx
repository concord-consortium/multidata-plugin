import React, { ReactNode, useState } from "react";
import { Editable, EditablePreview, EditableInput } from "@chakra-ui/react";

import css from "./editable-table-cell.scss";

interface IProps {
  attrId: number;
  collectionName: string;
  collectionId: number;
  children?: ReactNode;
  hasFocus?: boolean;
  selectedDataSetName?: string;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export const EditableTableHeader = (props: IProps) => {
  const { attrId, collectionName, hasFocus, renameAttribute } = props;
  const [displayValue, setDisplayValue] = useState(collectionName);
  const [editingValue, setEditingValue] = useState(displayValue);
  const [isEditing, setIsEditing] = useState(hasFocus);

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
      await renameAttribute(collectionName, attrId, displayValue, newValue);
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
        startWithEditView={hasFocus}
        submitOnBlur={true}
        value={isEditing ? editingValue : displayValue}
      >
        {!isEditing && <EditablePreview />}
        <EditableInput />
      </Editable>
    </div>
  );
};
