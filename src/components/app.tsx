import React, { useCallback, useEffect, useState } from "react";
import { InteractiveState, useCodapState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, IValues, ICollectionClass } from "../types";
import { PortraitView } from "./portrait-view";
import { Menu } from "./menu";
import { LandscapeView } from "./landscape-view";
import { FlatTable } from "./flat-table";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

function App() {
  const {selectedDataSet, dataSets, collections, items, handleSelectDataSet: _handleSelectDataSet,
         interactiveState, updateInteractiveState: _updateInteractiveState} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [displayMode, setDisplayMode] = useState<string>(none);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});

  // select the saved dataset on startup
  useEffect(() => {
    if (interactiveState?.dataSetName && !selectedDataSet) {
      _handleSelectDataSet(interactiveState.dataSetName);
    }
  }, [interactiveState, selectedDataSet, _handleSelectDataSet]);

  useEffect(() => {
    if (collections.length) {
      const classes = collections.map((coll: ICollection, idx: number) => {
        return {
          collectionName: coll.name,
          className: `collection${idx}`
        };
      });
      setCollectionClasses(classes);
    } else {
      setCollectionClasses([]);
    }
  }, [collections]);

  useEffect(() => {
    if (!selectedDataSet) {
      setDisplayMode("");
    }
  }, [selectedDataSet]);

  useEffect(() => {
    const style =  interactiveState.padding ? {padding: "7px"} : {padding: "0px"};
    setPaddingStyle(style);
  }, [interactiveState.padding]);

  const getClassName = (caseObj: IProcessedCaseObj) => {
    const {collection} = caseObj;
    const filteredClassNames = collectionClasses.filter((classObj) => {
      return classObj.collectionName === collection.name;
    });
    const className = filteredClassNames.length ? filteredClassNames[0].className : "";
    return className;
  };

  const updateInteractiveState = useCallback((update: Partial<InteractiveState>) => {
    const newState = {...interactiveState, ...update};
    if (JSON.stringify(newState) !== JSON.stringify(interactiveState)) {
      _updateInteractiveState(newState);
    }
  }, [interactiveState, _updateInteractiveState]);

  const togglePadding = useCallback(() => {
    updateInteractiveState({padding: !interactiveState.padding});
  }, [interactiveState, updateInteractiveState]);

  const toggleShowHeaders = useCallback(() => {
    updateInteractiveState({showHeaders: !interactiveState.showHeaders});
  }, [interactiveState, updateInteractiveState]);

  const handleSelectDisplayMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayMode(e.target.value);
  };

  const handleSelectDataSet = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const dataSetName = e.target.value;
    _handleSelectDataSet(dataSetName);
    updateInteractiveState({dataSetName});
  }, [_handleSelectDataSet, updateInteractiveState]);

  const mapHeadersFromValues = (values: IValues) => {
    return (
      <>
        {(Object.keys(values)).map((key, index) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th key={`${key}-${index}`}>{key}</th>);
            }
          }
        )}
      </>
    );
  };

  const mapCellsFromValues = (values: IValues) => {
    return (
      <>
        {(Object.values(values)).map((val, index) => {
          if (typeof val === "string" || typeof val === "number") {
              return (<td key={`${val}-${index}}`}>{val}</td>);
            }
          }
        )}
      </>
    );
  };

  const getValueLength = (firstRow: Array<IValues>) => {
    let valueCount = 0;
    firstRow.forEach((values: IValues) => {
      const valuesLength = Object.entries(values).length;
      valueCount += valuesLength;
    });
    return valueCount;
  };

  const renderTable = () => {
    const isNoHierarchy = collections.length === 1;
    const classesExist = collectionClasses.length > 0;
    const landscapeProps = {showHeaders: interactiveState.showHeaders, collectionClasses, collections, selectedDataSet,
      getClassName, mapHeadersFromValues, mapCellsFromValues, getValueLength};
    const portraitProps = {...landscapeProps, paddingStyle};
    const flatProps = {...landscapeProps, items};
    if (isNoHierarchy && classesExist) {
      return <FlatTable {...flatProps}/>;
    } else {
      return (
        displayMode === portrait ?
          <PortraitView {...portraitProps} /> :
        displayMode === landscape ?
          <LandscapeView {...landscapeProps} /> :
          <div/>
      );
    }
  };

  return (
    <div>
      <Menu
        dataSets={dataSets}
        collections={collections}
        selectedDataSet={selectedDataSet}
        handleSelectDataSet={handleSelectDataSet}
        handleSelectDisplayMode={handleSelectDisplayMode}
        togglePadding={togglePadding}
        toggleShowHeaders={toggleShowHeaders}
        showHeaders={interactiveState.showHeaders}
        displayMode={displayMode}
      />
      {selectedDataSet && renderTable()}
    </div>
  );
}

export default App;
