import React from "react";
import { observer } from "mobx-react-lite";
import { IDataSet } from "../types";

import css from "./menu.scss";

interface IProps {
  selectedDataSet: any,
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>, defaultDisplayMode?: string) => void,
  dataSets: Array<IDataSet>,

  // these are optional and only used by the nested table view
  handleSelectDisplayMode?: (mode: string) => void,
  togglePadding?: () => void,
  toggleShowHeaders?: () => void,
  showHeaders?: boolean,
  padding?: boolean;
  displayMode?: string;
  showDisplayMode?: boolean;
  defaultDisplayMode?: string;
}

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

export const Menu = observer(function Menu(props: IProps) {
  const {handleSelectDataSet, dataSets, handleSelectDisplayMode, togglePadding,
         showHeaders, padding, toggleShowHeaders, displayMode, selectedDataSet,
         showDisplayMode, defaultDisplayMode} = props;
  const displayModes = [none, portrait, landscape];

  const handleDataSetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (handleSelectDisplayMode && defaultDisplayMode) {
      handleSelectDisplayMode(defaultDisplayMode);
    }
    handleSelectDataSet(e, defaultDisplayMode);
  };

  return (
    <div className={css.menu}>
      <div className={css.option}>
        <span>Select a Dataset:</span>
        <select onChange={handleDataSetSelection} defaultValue={selectedDataSet?.name}>
          <option key="dataset-option--noDataset"></option>
          {dataSets?.length && dataSets.map((set) => {
            const dataSetIdentifier = set.title || set.name;
            return <option key={`dataset-option--${dataSetIdentifier}`}>{dataSetIdentifier}</option>;
          })}
        </select>
      </div>
      {/* Only allow shift in display mode if we are viewing a hierarhical data structure*/}
      {showDisplayMode && handleSelectDisplayMode &&
        <div className={css.option}>
          <span>Display mode:</span>
          <select onChange={(e) => handleSelectDisplayMode(e.currentTarget.value)} defaultValue={displayMode}>
            {displayModes.map((mode) => {
              return (
                <option key={`mode-option--${mode}`} disabled={!mode.length} value={mode}>
                  {mode.length ? mode : "--select--"}
                </option>
              );
            })}
          </select>
        </div>
      }
      {togglePadding && padding !== undefined &&
        <div className={css.option}>
          <span>Padding?</span>
          <input type="checkbox" checked={padding} onChange={togglePadding}/>
        </div>
      }
      {toggleShowHeaders && showHeaders !== undefined &&
        <div className={css.option}>
          <span>Show all case headers?</span>
          <input type="checkbox" checked={showHeaders} onChange={toggleShowHeaders}/>
        </div>
      }
    </div>
  );
});
