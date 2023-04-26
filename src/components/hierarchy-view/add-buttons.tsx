import React, { useState } from "react";
import { IBoundingBox, ICollection } from "../../types";
import AddIcon from "../../assets/add-icon.svg";

import css from "./add-buttons.scss";

interface IProps {
  collection: ICollection,
  handleAddAttribute: (coll: ICollection, newAttrName: string) => void
}

export const AddAttribute = ({collection, handleAddAttribute}: IProps) => {
  const [showInput, setShowInput] = useState<boolean>(false);
  const [newAttrName, setNewAttrName] = useState<string>("newAttr");

  const handleAddButtonClick = () => {
    setShowInput(true);
  };

  const renderInput = () => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAttrName(e.target.value);
    };

    const handleNewAttrNameClick = () => {
      handleAddAttribute(collection, newAttrName);
      setShowInput(false);
    };

    return (
      <div className={css.createNewAttr}>
        <input type="textbox" defaultValue={"newAttr"} onChange={handleChange}></input>
        <button onClick={handleNewAttrNameClick}>+</button>
      </div>
    );
  };

  return showInput ? renderInput() : (
    <div onClick={handleAddButtonClick} className={`${css.addButton} ${css.attribute}`}>
      <AddIcon />
    </div>
  );
};

interface IAddCollectionProps {
  levelBBox: IBoundingBox,
  handleAddCollection: (newCollectionName: string) => void,
  collections: Array<ICollection>
}

export const AddCollection = ({levelBBox, handleAddCollection, collections}: IAddCollectionProps) => {
  const {top, left, width} = levelBBox;
  const style: React.CSSProperties = {left: left + width, top, position: "absolute"};

  const [showTitleBox, setShowTitleBox] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClick = () => {
    setShowTitleBox(true);
  };

  const renderTitleBox = () => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewCollectionName(e.target.value);
    };

    const handleNewNameClick = () => {
      const isNameDuplicate = collections.find(coll => coll.name === newCollectionName);
      if (!newCollectionName.length) {
        setErrorMessage("Error: Collection name must be at least one character long.");
        setShowError(true);
      } else if (isNameDuplicate) {
        setErrorMessage("Error: A collection with that name already exists.");
        setShowError(true);
      } else {
        handleAddCollection(newCollectionName);
      }
    };

    return (
      <div className={css.createNewCollection} style={style}>
        <input type="textbox" defaultValue={``} onChange={handleChange}></input>
        <button className={css.submitButton} onClick={handleNewNameClick}>Create</button>
        {showError && <div className={css.error}>{errorMessage}</div>}
      </div>
    );
  };

  const renderAddButon = () => {
    return (
      <div onClick={handleClick} style={style} className={`${css.addButton} ${css.collection}`}><AddIcon /></div>
    );
  };

  return (
    <div>
      {showTitleBox ? renderTitleBox() : renderAddButon()}
    </div>
  );
};
