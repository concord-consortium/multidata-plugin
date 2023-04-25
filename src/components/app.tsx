import React, { useCallback, useEffect } from "react";
import { InteractiveState, useCodapState } from "../hooks/useCodapState";
import {NestedTable} from "./nested-table";
import {Hierarchy} from "./hierarchy";

import css from "./app.scss";

function App() {
  const {connected, selectedDataSet, dataSets, collections, items, interactiveState,
         updateInteractiveState: _updateInteractiveState,
         handleSelectDataSet: _handleSelectDataSet, handleUpdateAttributePosition,
         handleAddCollection
        } = useCodapState();

  const updateInteractiveState = useCallback((update: Partial<InteractiveState>) => {
    const newState = {...interactiveState, ...update};
    if (JSON.stringify(newState) !== JSON.stringify(interactiveState)) {
      _updateInteractiveState(newState);
    }
  }, [interactiveState, _updateInteractiveState]);

  const handleSetView = useCallback((view: InteractiveState["view"]) => {
    updateInteractiveState({view});
  }, [updateInteractiveState]);

  const handleSelectDataSet = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const dataSetName = e.target.value;
    _handleSelectDataSet(dataSetName);
    updateInteractiveState({dataSetName});
  }, [_handleSelectDataSet, updateInteractiveState]);

  const renderSelectView = () => {
    return (
      <div className={css.selectView}>
        <p>Which MultiData view do you want to use?</p>

        <div className={css.buttons}>
          <button onClick={() => handleSetView("hierarchy")}>Hierarchy</button>
          <button onClick={() => handleSetView("nested-table")}>Nested Table</button>
        </div>
      </div>
    );
  };

  // select the saved dataset on startup
  useEffect(() => {
    if (interactiveState?.dataSetName && !selectedDataSet) {
      _handleSelectDataSet(interactiveState.dataSetName);
    }
  }, [interactiveState, selectedDataSet, _handleSelectDataSet]);

  // unselect the dataset if it is deleted
  useEffect(() => {
    if (selectedDataSet && !dataSets.find(ds => ds.id === selectedDataSet.id)) {
      _handleSelectDataSet("");
    }
  }, [interactiveState, dataSets, selectedDataSet, _handleSelectDataSet]);

  if (!connected) {
    return <div className={css.loading}>Loading...</div>;
  }

  switch (interactiveState.view) {
    case "nested-table":
      return (
        <NestedTable
          selectedDataSet={selectedDataSet}
          dataSets={dataSets}
          collections={collections}
          items={items}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          updateInteractiveState={updateInteractiveState}
        />
      );

    case "hierarchy":
      return (
        <Hierarchy
          selectedDataSet={selectedDataSet}
          dataSets={dataSets}
          collections={collections}
          items={items}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          handleUpdateAttributePosition={handleUpdateAttributePosition}
          updateInteractiveState={updateInteractiveState}
          handleAddCollection={handleAddCollection}
        />
      );

    default:
      return renderSelectView();
  }
}

export default App;
