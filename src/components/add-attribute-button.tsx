import React from "react";
import { ICollection, ICollections } from "../types";

import AddIcon from "../assets/add-icon.svg";

import css from "./add-attribute-button.scss";

interface IProps {
  collectionId: number;
  collections: ICollections;
  handleAddAttribute?: (collection: ICollection, attrName: string) => Promise<void>;
}

export const AddAttributeButton: React.FC<IProps> = ({collections, collectionId, handleAddAttribute}: IProps) => {

  const handleAddAttributeToCollection = async () => {
    const collection = collections.find((c) => c.id === collectionId);
    collection && handleAddAttribute && await handleAddAttribute(collection, "");
  };

  return (
    <div className={css.addAttributeButtonContainer}>
      <button onClick={handleAddAttributeToCollection} className={css.addAttributeButton}>
        <AddIcon /> Add Attribute to Collection
      </button>
    </div>
  );
};
