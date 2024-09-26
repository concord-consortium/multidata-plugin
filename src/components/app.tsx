import React, { useCallback, useEffect, useRef, useState } from "react";
import { InteractiveState, useCodapState } from "../hooks/useCodapState";
import { NestedTable } from "./nested-table";
import { Hierarchy } from "./hierarchy-view/hierarchy";
import { CardView } from "./card-view/card-view";
import { ICaseObjCommon } from "../types";

import css from "./app.scss";

function App() {
  const {connected, selectedDataSet, dataSets, collectionsModel, cases, interactiveState,
         updateInteractiveState: _updateInteractiveState, init,
         handleSelectDataSet: _handleSelectDataSet, handleUpdateAttributePosition,
         handleAddCollection, handleAddAttribute, handleSelectSelf,
         updateTitle, selectCODAPCases, listenForSelectionChanges,
         handleCreateCollectionFromAttribute, handleSetCollections,
         handleSortAttribute, editCaseValue, renameAttribute } = useCodapState();
  const collections = collectionsModel.collections;

  useEffect(() => {
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateInteractiveState = useCallback((update: Partial<InteractiveState>) => {
    const newState = {...interactiveState, ...update};
    if (JSON.stringify(newState) !== JSON.stringify(interactiveState)) {
      _updateInteractiveState(newState);
    }
  }, [interactiveState, _updateInteractiveState]);

  const handleSetView = useCallback((view: InteractiveState["view"]) => {
    updateInteractiveState({view});
  }, [updateInteractiveState]);

  const handleSelectDataSet = useCallback((e: React.ChangeEvent<HTMLSelectElement>, defaultDisplayMode?: string) => {
    const dataSetName = e.target.value;
    _handleSelectDataSet(dataSetName);
    const update: Partial<InteractiveState> = {dataSetName};
    if (defaultDisplayMode) {
      update.displayMode = defaultDisplayMode;
    }
    updateInteractiveState(update);
  }, [_handleSelectDataSet, updateInteractiveState]);

  const handleShowComponent = () => {
    handleSelectSelf();
  };

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
      _handleSelectDataSet(interactiveState.dataSetName);
    }
  }, [interactiveState, selectedDataSet, _handleSelectDataSet]);

  // unselect the dataset if it is deleted
  useEffect(() => {
    if (selectedDataSet && !dataSets.find(ds => ds.id === selectedDataSet.id)) {
      _handleSelectDataSet("");
    }
  }, [interactiveState, dataSets, selectedDataSet, _handleSelectDataSet]);

  const listeningToDataSetId = useRef(0);
  const [codapSelectedCase, setCodapSelectedCase] = useState<ICaseObjCommon|undefined>(undefined);
  useEffect(() => {
    if (selectedDataSet && listeningToDataSetId.current !== selectedDataSet.id) {
      listenForSelectionChanges((notification) => {
        const result = notification?.values?.result;
        let newCase: ICaseObjCommon|undefined = undefined;
        if (result?.success && result.cases?.length >= 0) {
          newCase = result.cases[0];
        }
        setCodapSelectedCase(newCase);
      });
      listeningToDataSetId.current = selectedDataSet.id;
    }
  }, [selectedDataSet, listenForSelectionChanges, setCodapSelectedCase]);

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
          cases={cases}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          updateInteractiveState={updateInteractiveState}
          handleShowComponent={handleShowComponent}
          handleUpdateAttributePosition={handleUpdateAttributePosition}
          handleCreateCollectionFromAttribute={handleCreateCollectionFromAttribute}
          editCaseValue={editCaseValue}
          handleSortAttribute={handleSortAttribute}
          handleAddAttribute={handleAddAttribute}
          renameAttribute={renameAttribute}
        />
      );

    case "hierarchy":
      return (
        <Hierarchy
          selectedDataSet={selectedDataSet}
          dataSets={dataSets}
          collections={collections}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          handleUpdateAttributePosition={handleUpdateAttributePosition}
          updateInteractiveState={updateInteractiveState}
          handleAddCollection={handleAddCollection}
          handleAddAttribute={handleAddAttribute}
          handleShowComponent={handleShowComponent}
          handleSetCollections={handleSetCollections}
        />
      );

    case "card-view":
      return (
        <CardView
          selectedDataSet={selectedDataSet}
          dataSets={dataSets}
          collectionsModel={collectionsModel}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          updateTitle={updateTitle}
          selectCases={selectCODAPCases}
          codapSelectedCase={codapSelectedCase}
        />
      );

    default:
      return (
        <div onClick={handleShowComponent}>
          {renderSelectView()}
        </div>
      );
  }
}

export default App;
