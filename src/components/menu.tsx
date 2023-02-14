import React from "react";
import { ICollection, IDataSet } from "../types";
import css from "./menu.scss";

interface IProps {
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  collections: Array<ICollection>,
  dataSets: Array<IDataSet>,
  handleSelectDisplayMode: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  togglePadding: () => void,
  showHeaders: boolean,
  toggleShowHeaders: () => void,
  displayMode: string
}

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

export const Menu = (props: IProps) => {
  const {handleSelectDataSet, collections, dataSets, handleSelectDisplayMode, togglePadding,
    showHeaders, toggleShowHeaders, displayMode} = props;

  const displayModes = [none, portrait, landscape];

  return (
    <div className={css.menu}>
      <div className={css.option}>
        <span>Select a Dataset:</span>
        <select onChange={handleSelectDataSet}>
          <option></option>
          {dataSets?.length && dataSets.map((set) => {
            return (<option key={set.title}>{set.title}</option>);
          })}
        </select>
      </div>
      {/* Only allow shift in display mode if we are viewing a hierarhical data structure*/}
      {collections.length > 1 &&
        <div className={css.option}>
          <span>Display mode:</span>
          <select onChange={handleSelectDisplayMode}>
            {displayModes.map((mode) => {
              return (
                <option key={mode} disabled={!mode.length} selected={displayMode === mode} value={mode}>
                  {mode.length ? mode : "--select--"}
                </option>
              );
            })}
          </select>
        </div>
      }
      <div className={css.option}>
        <span>Padding?</span>
        <input type="checkbox" onChange={togglePadding}/>
      </div>
      <div className={css.option}>
        <span>Show all case headers?</span>
        <input type="checkbox" checked={showHeaders} onChange={toggleShowHeaders}/>
      </div>
    </div>
  );
};
