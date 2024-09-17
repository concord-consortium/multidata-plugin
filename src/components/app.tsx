import React, { useCallback, useEffect, useState } from "react";
import { useCodapContext } from "../hooks/useCodapContext";
import { InteractiveState } from "../types";
import { NestedTable } from "./nested-table";
import { Hierarchy } from "./hierarchy-view/hierarchy";
import { CardView } from "./card-view/card-view";

import css from "./app.scss";

function App() {
  const { handleUpdateInteractiveState, handleSelectDataSet, interactiveState, selectedDataSet, dataSets,
    connected, handleSelectSelf } = useCodapContext();

  const [view, setView] = useState<InteractiveState["view"]>(null);

  const handleSetView = useCallback((newView: InteractiveState["view"]) => {
    setView(newView);
    handleUpdateInteractiveState({view: newView});
  }, [handleUpdateInteractiveState]);

  const onSelectDataSet = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    handleSelectDataSet(name);
  }, [handleSelectDataSet]);

  const renderSelectView = () => {
    return (
      <div className={css.selectView}>
        <p>Which MultiData view do you want to use?</p>
        <div className={css.buttons}>
          <button onClick={() => handleSetView("hierarchy")}>Hierarchy</button>
          <button onClick={() => handleSetView("nested-table")}>Nested Table</button>
          <button onClick={() => handleSetView("card-view")}>Card View</button>
        </div>
      </div>
    );
  };

  // select the saved dataset on startup
  useEffect(() => {
    if (interactiveState?.dataSetName && !selectedDataSet) {
      handleSelectDataSet(interactiveState.dataSetName);
    }
  }, [interactiveState, selectedDataSet, handleSelectDataSet]);

  // unselect the dataset if it is deleted
  useEffect(() => {
    if (selectedDataSet && !dataSets.find(ds => ds.id === selectedDataSet.id)) {
      handleSelectDataSet("");
    }
  }, [interactiveState, dataSets, selectedDataSet, handleSelectDataSet]);

  if (!connected) {
    return <div className={css.loading}>Loading...</div>;
  }

  switch (view) {
    case "nested-table":
      return (
        <NestedTable
          onSelectDataSet={onSelectDataSet}
          selectedDataSet={selectedDataSet}
        />
      );

    case "hierarchy":
      return (
        <Hierarchy
          onSelectDataSet={onSelectDataSet}
        />
      );

    case "card-view":
      return (
        <CardView
          onSelectDataSet={onSelectDataSet}
        />
      );

    default:
      return (
        <div onClick={handleSelectSelf}>
          { dataSets.length === 0 ? <p>No datasets available</p> :  renderSelectView() }
        </div>
      );
  }
}

export default App;
