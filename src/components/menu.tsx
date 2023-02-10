import React from "react";
import { ICollection, IDataSet } from "../types";
import "./menu.css";

interface IProps {
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  collections: Array<ICollection>,
  dataSets: Array<IDataSet>,
  handleSelectDisplayMode: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  togglePadding: () => void,
  showHeaders: boolean,
  toggleShowHeaders: () => void
}

export const Menu = (props: IProps) => {
  const {handleSelectDataSet, collections, dataSets, handleSelectDisplayMode, togglePadding,
    showHeaders, toggleShowHeaders} = props;

  return (
    <div className="menu">
      <div className="data-sets">
        <span>Select a Dataset:</span>
        <select onChange={handleSelectDataSet}>
          <option></option>
          {dataSets?.length && dataSets.map((set, i) => {
            return (<option key={`${set.title + i}`}>{set.title}</option>);
          })}
        </select>
      </div>
      {/* Only allow shift in display mode if we are viewing a hierarhical data structure*/}
      {collections.length > 1 &&
        <div className="display-mode">
          <span>Display mode:</span>
          <select onChange={handleSelectDisplayMode}>
            <option value="none"></option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
      }
      <div className="set-padding">
        <span>Padding?</span>
        <input type="checkbox" onChange={togglePadding}/>
      </div>
      <div className="set-headers">
        <span>Show all case headers?</span>
        <input type="checkbox" checked={showHeaders} onChange={toggleShowHeaders}/>
      </div>
    </div>
  );
};
