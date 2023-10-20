import React, { forwardRef } from "react";
import { ICollection, IDataSet } from "../types";
import css from "./menu.scss";

interface IProps {
  selectedDataSet: any,
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  collections: Array<ICollection>,
  dataSets: Array<IDataSet>,

  // these are optional and only used by the nested table view
  handleSelectDisplayMode?: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  togglePadding?: () => void,
  toggleShowHeaders?: () => void,
  showHeaders?: boolean,
  padding?: boolean;
  displayMode?: string
}

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

// eslint-disable-next-line react/display-name
export const Menu = forwardRef<HTMLDivElement, IProps>((props: IProps, ref) => {
  const {handleSelectDataSet, collections, dataSets, handleSelectDisplayMode, togglePadding,
    showHeaders, padding, toggleShowHeaders, displayMode, selectedDataSet} = props;

  const displayModes = [none, portrait, landscape];

  return (
    <div className={css.menu} ref={ref}>
      <div className={css.option}>
        <span>Select a Dataset:</span>
        <select value={selectedDataSet?.name} onChange={handleSelectDataSet}>
          <option></option>
          {dataSets?.length && dataSets.map((set) => {
            return (<option key={set.title}>{set.title}</option>);
          })}
        </select>
      </div>
      {/* Only allow shift in display mode if we are viewing a hierarhical data structure*/}
      {collections.length > 1 && handleSelectDisplayMode &&
        <div className={css.option}>
          <span>Display mode:</span>
          <select value={displayMode} onChange={handleSelectDisplayMode}>
            {displayModes.map((mode) => {
              return (
                <option key={mode} disabled={!mode.length} value={mode}>
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
