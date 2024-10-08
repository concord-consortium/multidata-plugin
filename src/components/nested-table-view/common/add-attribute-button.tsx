import React from "react";
import { ICollection, ICollections } from "../../../types";

import AddIcon from "../../../assets/add-icon.svg";

import css from "./add-attribute-button.scss";

interface IProps {
  collectionId: number;
  collections: ICollections;
  tableIndex?: number;
  handleAddAttribute: (collection: ICollection, attrName: string, tableIndex: number) => Promise<void>;
}

export const AddAttributeButton: React.FC<IProps> = (props: IProps) => {
  const { collections, collectionId, handleAddAttribute, tableIndex=0 } = props;

  const handleAddAttributeToCollection = async () => {
    const collection = collections.find((c) => c.id === collectionId);
    collection && await handleAddAttribute(collection, "", tableIndex);
  };

  return (
    <div className={css.addAttributeButtonContainer}>
      <button onClick={handleAddAttributeToCollection} className={css.addAttributeButton}>
        <AddIcon /> Add Attribute to Collection
      </button>
    </div>
  );
};
