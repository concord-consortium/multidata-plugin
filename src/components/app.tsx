import React, { useEffect, useState } from "react";
import "./app.css";
import { useCodapState } from "../hooks/useCodapState";

interface ICollectionClass {
    collectionName: string;
    className: string;
}

function App() {
  const {dataSets, selectedDataSet, collections, items, handleSelectDataSet} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [padding, setPadding] = useState<boolean>(false);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});


  useEffect(() => {
    if (collections.length) {
      const classes = collections.map((coll, idx) => {
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
    const className = collectionClasses.filter((classObj) => {
      return classObj.collectionName === collection.name;
    })[0].className || "";
    return className;
  };

  const togglePadding = () => {
    setPadding(!padding);
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
          {collection.attrs.map((attr: any, i) => <th key={i}>{attr.title}</th>)}
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
    return parentColl.cases.map((caseObj) => renderRowFromCaseObj(caseObj));
  };

  const renderRowFromCaseObj = (caseObj: IProcessedCaseObj) => {
    const {children, values} = caseObj;
    if (!children.length) {
      return (
        <tr>{mapCellsFromValues(values)}</tr>
      );
    } else {
      return (
        <tr>
          {(Object.values(values)).filter(val => typeof val === "string" || typeof val === "number").length > 1 ?
            <td style={paddingStyle}>
              <table className={`sub-table ${getClassName(caseObj)}`}>
                <tbody>
                  <tr className="sub-header-row">{mapHeadersFromValues(values)}</tr>
                  <tr>{mapCellsFromValues(values)}</tr>
                </tbody>
              </table>
            </td>
            : mapCellsFromValues(values)
          }

          <td style={paddingStyle}>
            <table style={paddingStyle} className={`sub-table`}>
              <tbody>
                {caseObj.children.map((child, i) => {
                  const childHasChildren = child.children.length > 0;
                  if (i === 0) {
                    return (
                      <>
                        <tr className={`sub-header-row ${getClassName(child)}`}>
                          {mapHeadersFromValues(child.values)}
                          {childHasChildren &&
                            <th className={`${getClassName(child.children[0])}`}>
                              {child.children[0].collection.name}
                            </th>
                          }
                        </tr>
                        {renderRowFromCaseObj(child)}
                      </>
                      );
                  } else {
                    return (renderRowFromCaseObj(child));
                  }
                })}
              </tbody>
            </table>
          </td>
        </tr>
      );
    }
  };

  const renderTable = () => {
    return (
      <table className={`main-table ${collectionClasses[0].className}`}>
        <tbody>
          <tr className={`${collectionClasses[0].className}`}>
            {
              collections.length === 1 ? <th>{collections[0].title}</th> :
              collections.filter((c, i) => i === 0 || i === 1).map((c, i) => {
                return (
                  <th key={i} className={i === 0 ? collectionClasses[0].className : collectionClasses[1].className}>
                    {c.title}
                  </th>
                );
              })
            }
          </tr>
          {
            collections.length === 1 ? renderSingleTable() :
            renderNestedTable(collections.filter(coll => !coll.parent)[0])
          }
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
      </div>
      {selectedDataSet && collections.length && collectionClasses.length && renderTable()}
    </div>
  );
}

export default App;
