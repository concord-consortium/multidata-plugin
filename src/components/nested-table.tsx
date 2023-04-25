import React, { useCallback, useEffect, useState } from "react";
import { InteractiveState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, IValues, ICollectionClass, IDataSet, ICollections } from "../types";
import { PortraitView } from "./portrait-view";
import { Menu } from "./menu";
import { LandscapeView } from "./landscape-view";
import { FlatTable } from "./flat-table";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

interface IProps {
  selectedDataSet: any;
  dataSets: IDataSet[];
  collections: ICollections;
  items: any[];
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateInteractiveState: (update: Partial<InteractiveState>) => void
}

export const NestedTable = (props: IProps) => {
  const {selectedDataSet, dataSets, collections, items, interactiveState,
         handleSelectDataSet, updateInteractiveState} = props;
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});

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
    if (!interactiveState.dataSetName) {
      updateInteractiveState({displayMode: none});
    }
  }, [interactiveState.dataSetName, updateInteractiveState]);

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

  const togglePadding = useCallback(() => {
    updateInteractiveState({padding: !interactiveState.padding});
  }, [interactiveState, updateInteractiveState]);

  const toggleShowHeaders = useCallback(() => {
    updateInteractiveState({showHeaders: !interactiveState.showHeaders});
  }, [interactiveState, updateInteractiveState]);

  const handleSelectDisplayMode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateInteractiveState({displayMode: e.target.value});
  }, [updateInteractiveState]);

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
    const tableProps = {showHeaders: interactiveState.showHeaders, collectionClasses, collections, selectedDataSet,
      getClassName, mapHeadersFromValues, mapCellsFromValues, getValueLength, paddingStyle};
    const flatProps = {...tableProps, items};
    if (isNoHierarchy && classesExist) {
      return <FlatTable {...flatProps}/>;
    } else {
      return (
        interactiveState.displayMode === portrait ?
          <PortraitView {...tableProps} /> :
          interactiveState.displayMode === landscape ?
          <LandscapeView {...tableProps} /> :
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
        padding={interactiveState.padding}
        displayMode={interactiveState.displayMode}
      />
      {selectedDataSet && renderTable()}
    </div>
  );
};

export default NestedTable;
