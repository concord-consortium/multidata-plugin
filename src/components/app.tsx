import React, { useEffect, useState } from "react";
import { useCodapState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, IValues, ICollectionClass } from "../types";
import { PortraitView } from "./portrait-view";
import { Menu } from "./menu";
import { LandscapeView } from "./landscape-view";
import { FlatTable } from "./flat-table";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

function App() {
  const {selectedDataSet, dataSets, collections, items, handleSelectDataSet} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [displayMode, setDisplayMode] = useState<string>(none);
  const [padding, setPadding] = useState<boolean>(false);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});
  const [showHeaders, setShowHeaders] = useState<boolean>(false);

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
    const style =  padding ? {padding: "7px"} : {padding: "0px"};
    setPaddingStyle(style);
  }, [padding]);

  const getClassName = (caseObj: IProcessedCaseObj) => {
    const {collection} = caseObj;
    const filteredClassNames = collectionClasses.filter((classObj) => {
      return classObj.collectionName === collection.name;
    });
    const className = filteredClassNames.length ? filteredClassNames[0].className : "";
    return className;
  };

  const togglePadding = () => {
    setPadding(!padding);
  };

  const toggleShowHeaders = () => {
    setShowHeaders(!showHeaders);
  };

  const handleSelectDisplayMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayMode(e.target.value);
  };

  const mapHeadersFromValues = (values: IValues) => {
    return (
      <>
        {(Object.keys(values)).map((key) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th key={key}>{key}</th>);
            }
          }
        )}
      </>
    );
  };

  const mapCellsFromValues = (values: IValues) => {
    return (
      <>
        {(Object.values(values)).map((val) => {
          if (typeof val === "string" || typeof val === "number") {
              return (<td key={val}>{val}</td>);
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
    const landscapeProps = {showHeaders, collectionClasses, collections, selectedDataSet,
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
        handleSelectDataSet={handleSelectDataSet}
        handleSelectDisplayMode={handleSelectDisplayMode}
        togglePadding={togglePadding}
        toggleShowHeaders={toggleShowHeaders}
        showHeaders={showHeaders}
        displayMode={displayMode}
      />
      {selectedDataSet && renderTable()}
    </div>
  );
}

export default App;
