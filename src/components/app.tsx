import React, { useCallback, useEffect, useRef, useState } from "react";
import { InteractiveState, useCodapState } from "../hooks/useCodapState";
import { NestedTable } from "./nested-table-view/nested-table";
import { Hierarchy } from "./hierarchy-view/hierarchy";
import { CardView } from "./card-view/card-view";
import { ISelectedCase } from "../types";

import css from "./app.scss";

function App() {
  const {connected, selectedDataSet, dataSets, collectionsModel, cases, interactiveState,
         updateInteractiveState: _updateInteractiveState, init,
         handleSelectDataSet: _handleSelectDataSet, handleUpdateAttributePosition,
         handleAddCollection, handleAddAttribute, handleSelectSelf,
         updateTitle, selectCODAPCases, listenForSelectionChanges, updateSelection,
         handleCreateCollectionFromAttribute, handleSetCollections,
         editCaseValue, renameAttribute } = useCodapState();
  const collections = collectionsModel.collections;
  const listeningToDataSetId = useRef(0);
  const [selectionList, setSelectionList] = useState<ISelectedCase[]>([]);

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

  const handleSelectDataSet = useCallback(
      async (e: React.ChangeEvent<HTMLSelectElement>, defaultDisplayMode?: string) => {
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

  //if there is a selected dataset, check if there are selected cases
  useEffect(() => {
    const fetchData = async () => {
      if (selectedDataSet  && !selectionList) {
        const initSelectedCases: ISelectedCase[] = await updateSelection()
        setSelectionList(initSelectedCases);
      }
    };
    fetchData();
  }, [selectedDataSet, selectionList, updateSelection]);
  // unselect the dataset if it is deleted
  useEffect(() => {
    if (selectedDataSet && !dataSets.find(ds => ds.id === selectedDataSet.id)) {
      _handleSelectDataSet("");
    }
  }, [interactiveState, dataSets, selectedDataSet, _handleSelectDataSet]);

  useEffect(() => {
    if (selectedDataSet && listeningToDataSetId.current !== selectedDataSet.id) {
      listenForSelectionChanges(async (notification) => {
        const result = notification?.values?.result;
        if (result?.success) {
          const newList = await updateSelection();
          setSelectionList(newList);
        }
      });
      listeningToDataSetId.current = selectedDataSet.id;
    }
  }, [selectedDataSet, listenForSelectionChanges, updateSelection]);

  if (!connected) {
    return <div className={css.loading}>Loading...</div>;
  }

  switch (interactiveState.view) {
    case "nested-table":
      return (
        <NestedTable
          selectedDataSet={selectedDataSet}
          dataSets={dataSets}
          collectionsModel={collectionsModel}
          cases={cases}
          interactiveState={interactiveState}
          handleSelectDataSet={handleSelectDataSet}
          updateInteractiveState={updateInteractiveState}
          handleShowComponent={handleShowComponent}
          handleUpdateAttributePosition={handleUpdateAttributePosition}
          handleCreateCollectionFromAttribute={handleCreateCollectionFromAttribute}
          editCaseValue={editCaseValue}
          handleAddAttribute={handleAddAttribute}
          renameAttribute={renameAttribute}
          selectCases={selectCODAPCases}
          selectionList={selectionList}
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
          selectedCase={selectionList?.[0]}
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
