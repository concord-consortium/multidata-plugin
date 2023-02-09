import React, { useEffect, useState } from "react";
import "./app.css";
import { useCodapState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, IValues } from "../types";
import { PortraitView } from "./portrait-view";
import { Menu } from "./menu";
import { LandscapeView } from "./landscape-view";

interface ICollectionClass {
    collectionName: string;
    className: string;
}

function App() {
  const {selectedDataSet, dataSets, collections, items, handleSelectDataSet} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [displayMode, setDisplayMode] = useState<string>("");
  const [padding, setPadding] = useState<boolean>(false);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});
  const [showHeaders, setShowHeaders] = useState<boolean>(false);

  useEffect(() => {
    if (collections.length) {
      const classes = collections.map((coll: ICollection, idx: number) => {
        return {
          collectionName: coll.name,
          className: `collection-${idx}`
        };
      });
      setCollectionClasses(classes);
    } else {
      setCollectionClasses([]);
    }
  }, [collections]);

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

  const handleSelectDisplayMode = (e: any) => {
    setDisplayMode( e.target.value);
  };

  const mapCellsFromValues = (values: IValues) => {
    return (
      <>
        {(Object.values(values)).map((val, i) => {
          if (typeof val === "string" || typeof val === "number") {
              return (<td key={i}>{val}</td>);
            }
          }
        )}
      </>
    );
  };

  const renderSingleTable = () => {
    const collection = collections[0];

    return (
      <table className={`main-table ${collectionClasses[0].className}`}>
        <tbody>
          <tr className={`${collectionClasses[0].className}`}>
            <th colSpan={items.length}>{collections[0].title}</th>
          </tr>
          <tr>
            {collection.attrs.map((attr: any, i: number) => <th key={i}>{attr.title}</th>)}
          </tr>
          {items.length && items.map((item, i) => {
            return (
              <tr key={i}>{mapCellsFromValues(item)}</tr>
            );
          })}
        </tbody>
      </table>
    );
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
      />
      { collections.length === 1 && renderSingleTable() }
      { displayMode === "portrait" &&
        <PortraitView
          paddingStyle={paddingStyle}
          showHeaders={showHeaders}
          collectionClasses={collectionClasses}
          collections={collections}
          selectedDataSet={selectedDataSet}
          getClassName={getClassName}
        />
      }
      { displayMode === "landscape" &&
        <LandscapeView
          paddingStyle={paddingStyle}
          showHeaders={showHeaders}
          collectionClasses={collectionClasses}
          collections={collections}
          selectedDataSet={selectedDataSet}
          getClassName={getClassName}
        />
      }
    </div>
  );
}

export default App;
