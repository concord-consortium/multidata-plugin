import React, { useState } from 'react';
import './App.css';
import { useCodapState } from './hooks/useCodapState';

function App() {
  const { dataSets, selectedDataSet, collections, items, handleSelectDataSet } = useCodapState();
  const [padding, setPadding] = useState(false);

  const mapHeadersFromValues = (values) => {
    return (
      <>
        {(Object.keys(values)).map((key) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th>{key}</th>);
            }
          }
        )}
      </>
    );
  }

  const mapCellsFromValues = (values) => {
    return (
      <>
        {Object.values(values).map(val => {
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
            <td style={{padding: padding ? "7px" : "0px", border: padding ? "1px solid black" : "0px"}}>
              <table className="sub-table">
                <tbody>
                  <tr className="sub-header-row">{mapHeadersFromValues(values)}</tr>
                  <tr>{mapCellsFromValues(values)}</tr>
                </tbody>
              </table>
            </td>
            : mapCellsFromValues(values)
          }
          <td className={"main-td"} style={{padding: padding ? "7px" : "0px"}}>
            <table style={{padding: padding ? "7px" : "0px", border: padding ? "1px solid black" : "none"}} className="sub-table">
              <tbody>
                {caseObj.children.map((child, i) => {
                  if (i === 0) {
                    return (
                      <>
                        <tr className="sub-header-row">
                          {mapHeadersFromValues(child.values)}
                          {child.children.length ? <th>{child.children[0].collection.name}</th> : <></>}
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
        </>
      );
    }}

  const renderTable = () => {
    return (
      <table className="main-table">
        <tbody className="main-tbody">
          <tr className="main-header-row">
            {
              collections.length === 1 ? <th className="main-header">{collections[0].title}</th> :
              collections.filter((c, i) => i === 0 || i === 1).map((c) => <th className="main-header">{c.title}</th>)
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

  const togglePadding = () => {
    if (padding) {
      setPadding(false)
    } else {
      setPadding(true);
    }
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
      {selectedDataSet && collections.length && renderTable()}
  </div>);
}

export default App;
