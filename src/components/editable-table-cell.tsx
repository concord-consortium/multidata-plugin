import React, { ReactNode, useState } from "react";
import { Editable, EditablePreview, EditableInput } from "@chakra-ui/react";
import { updateCaseById } from "@concord-consortium/codap-plugin-api";

interface IProps {
  attrTitle: string;
  caseId: string;
  children: ReactNode;
  handleUpdateCollections: () => void;
  selectedDataSetName: string;
}

export const EditableTableCell = (props: IProps) => {
  const { attrTitle, caseId, children, handleUpdateCollections, selectedDataSetName } = props;
  const displayValue = String(children);
  const [editingValue, setEditingValue] = useState(displayValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleChangeValue = (newValue: string) => {
    setEditingValue(newValue);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (nextValue: string) => {
    try {
      await updateCaseById(selectedDataSetName, caseId, {[attrTitle]: nextValue});
    } catch (e) {
      console.error("Case not updated: ", e);
    }
    setIsEditing(false);
    handleUpdateCollections();
  };

  return (
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
      <EditableInput value={editingValue} />
    </Editable>
  );
};
