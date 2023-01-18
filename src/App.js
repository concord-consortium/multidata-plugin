import React, { useEffect, useState } from 'react';
import './App.css';
import { useCodapState } from './hooks/useCodapState';


function App() {
  const {dataSets, selectedDataSet, collections, items, handleSelectDataSet} = useCodapState();
  const [collectionClasses, setCollectionClasses] = useState([]);
  const [padding, setPadding] = useState(false);
  const [paddingStyle, setPaddingStyle] = useState({padding: "7px"})

  useEffect(() => {
    if (collections.length) {
      const classes = collections.map((coll, idx) => {return {collectionName: coll.name, className: `collection-${idx}`}});
      setCollectionClasses(classes);
    }
  }, [collections])

  useEffect(() => {
    padding ? setPaddingStyle({padding: "7px"}) : setPaddingStyle({padding: "0px"});
  }, [padding])

  const getClassName = (caseObj) => {
    const {collection} = caseObj;
    const className = collectionClasses.filter((classObj) => classObj.collectionName === collection.name)[0].className || "";
    return className;
  }

  const togglePadding = () => {
    padding ? setPadding(false) : setPadding(true);
  }

  const mapHeadersFromValues = (values) => {
    return (
      <>
        {(Object.keys(values)).map((key) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th >{key}</th>);
            }
          }
        )}
      </>
    );
  }

  const mapCellsFromValues = (values) => {
    return (
      <>
        {(Object.values(values)).map((val) => {
          if (typeof val === "string" || typeof val === "number") {
              return (<td>{val}</td>);
            }
          }
        )}
      </>
    );
  }

  const renderSingleTable = () => {
    const collection = collections[0];
    return (
      <>
        <tr>
          {collection.attrs.map((attr) => {
            return (
              <th>
                {attr.title}
              </th>
            );
          })}
        </tr>
        {items.length && items.map((item) => {
          return (
            <tr>{mapCellsFromValues(item)}</tr>
          )
        })}
      </>
    )
  };

  const renderNestedTable = (parentColl) => {
    return parentColl.cases.map((caseObj) => renderRowFromCaseObj(caseObj));
  }

  const renderRowFromCaseObj = (caseObj) => {
    const {children, values} = caseObj;
    if (!children.length) {
      return (
        <tr>{mapCellsFromValues(values)}</tr>
      )
    } else {
      return (
        <>
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

            <td className={"main-td"} style={paddingStyle}>
              <table style={paddingStyle} className={`sub-table`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0) {
                      return (
                        <>
                          <tr className={`sub-header-row ${getClassName(child)}`}>
                            {mapHeadersFromValues(child.values)}
                            {child.children.length ? <th className={`${getClassName(child.children[0])}`}>{child.children[0].collection.name}</th> : <></>}
                          </tr>
                          {renderRowFromCaseObj(child, null, i)}
                        </>
                        );
                    } else {
                      return (renderRowFromCaseObj(child, null, i));
                    }
                  })}
                </tbody>
              </table>
            </td>

          </tr>
        </>
      );
    }}

  const renderTable = () => {
    return (
      <table className={`main-table ${collectionClasses[0].className}`}>
        <tbody>
          <tr className={`${collectionClasses[0].className}`}>
            {
              collections.length === 1 ? <th>{collections[0].title}</th> :
              collections.filter((c, i) => i === 0 || i === 1).map((c, i) => {
                return <th className={i === 0 ? collectionClasses[0].className : collectionClasses[1].className}>{c.title}</th>
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
  }

  return (
    <div>
      <div className="controls">
        <div className="data-sets">
          <span>Select a Dataset:</span>
          <select onChange={handleSelectDataSet}>
            <option default></option>
            {dataSets && dataSets.length && dataSets.map((set) => {return (<option>{set.title}</option>)})}
          </select>
        </div>
        <div className="set-padding">
          <span>Padding?</span>
          <input type="checkbox" onChange={togglePadding}/>
        </div>
      </div>
      {selectedDataSet && collectionClasses.length && renderTable()}
  </div>);
}

export default App;
