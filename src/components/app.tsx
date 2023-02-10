import React, { useEffect, useState } from "react";
import "./app.css";
import { useCodapState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, IValues } from "../types";

interface ICollectionClass {
    collectionName: string;
    className: string;
}

function App() {
  const {dataSets, selectedDataSet, collections, items, handleSelectDataSet} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
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

  const mapHeadersFromValues = (values: IValues) => {
    return (
      <>
        {(Object.keys(values)).map((key, i) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th key={i}>{key}</th>);
            }
          }
        )}
      </>
    );
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
      <>
        <tr>
          {collection.attrs.map((attr: any, i: number) => <th key={i}>{attr.title}</th>)}
        </tr>
        {items.length && items.map((item, i) => {
          return (
            <tr key={i}>{mapCellsFromValues(item)}</tr>
          );
        })}
      </>
    );
  };

  const renderNestedTable = (parentColl: ICollection) => {
    return parentColl.cases.map((caseObj, index) => renderRowFromCaseObj(caseObj, index));
  };

  const renderRowFromCaseObj = (caseObj: IProcessedCaseObj, index?: null|number) => {
    const {children, values} = caseObj;
    if (!children.length) {
      return (
          <tr>{mapCellsFromValues(values)}</tr>
      );
    } else {
      return (
        <>
          {index === 0 ?
            <tr className={`${getClassName(caseObj)}`}>
              {mapHeadersFromValues(values)}
              <th>{showHeaders ? children[0].collection.name : ""}</th>
            </tr> : ""
          }
          <tr>
            {mapCellsFromValues(values)}
            <td style={paddingStyle}>
              <table style={paddingStyle} className={`sub-table ${getClassName(children[0])}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0 && !child.children.length) {
                      return (
                        <>
                          <tr key={i} className={`${getClassName(child)}`}>{mapHeadersFromValues(child.values)}</tr>
                          {renderRowFromCaseObj(child, i)}
                        </>
                      );
                    } else {
                      return (renderRowFromCaseObj(child, i));
                    }
                  })}
                </tbody>
              </table>
            </td>
          </tr>
        </>
      );
    }
  };

  const renderTable = () => {
    const isSingleCollection = collections.length === 1;
    const parentColl = collections.filter((coll: ICollection) => !coll.parent);
    return (
      <table className={`main-table ${collectionClasses[0].className}`}>
        <tbody>
          <tr className={`${collectionClasses[0].className}`}>
            <th colSpan={isSingleCollection ? items.length : collections.length}>{collections[0].title}</th>
          </tr>
          {isSingleCollection ? renderSingleTable() : renderNestedTable(parentColl[0])}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div className="controls">
        <div className="data-sets">
          <span>Select a Dataset:</span>
          <select onChange={handleSelectDataSet}>
            <option></option>
            {dataSets?.length && dataSets.map((set, i) => {return (<option key={i}>{set.title}</option>);})}
          </select>
        </div>
        <div className="set-padding">
          <span>Padding?</span>
          <input type="checkbox" onChange={togglePadding}/>
        </div>
        <div className="set-headers">
          <span>Show all case headers?</span>
          <input type="checkbox" checked={showHeaders} onChange={toggleShowHeaders}/>
        </div>
      </div>
      {selectedDataSet && collections.length && collectionClasses.length && renderTable()}
    </div>
  );
}

export default App;
