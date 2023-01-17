import React, {useEffect} from 'react';
import './App.css';
import { useCodapState } from './hooks/useCodapState';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function App() {
  const { dataSets, selectedDataSet, collections, items, handleSelectDataSet } = useCodapState();

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
            )
          })}
        </tr>
        {items.length && items.map((item) => {
          return (
            <tr>{Object.values(item).map(val => <td>{val}</td>)}</tr>
          )
        })}
      </>
    )
  };

  const renderNestedTable = (parentColl) => {
    return parentColl.cases.map((caseObj) => renderRowFromCaseObj(caseObj));
  }

  const renderRowFromCaseObj = (caseObj) => {
    if (!caseObj.children.length) {
      return (
        <tr>{(Object.values(caseObj.values)).map(val => <td>{val}</td>)}</tr>
      )
    } else {
      return (
        <>
        <tr>
          {(Object.values(caseObj.values)).map(val => <td>{val}</td>)}
          <td>
            <table className="sub-table">
              <tbody>
                {caseObj.children.map((child, i) => {
                  console.log("child.children", child.children);
                  if (i === 0) {
                    return (
                      <>
                      <tr className="sub-header-row">
                        {(Object.keys(child.values).map(key => <th>{key}</th>))}
                        {child.children.length ? <th>{child.children[0].collection.name}</th> : ""}
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
        <tbody>
          <tr className="main-header-row">
            {
              collections.length === 1 ? <th>{collections[0].title}</th> :
              collections.length === 2 ? collections.map(c => <th>{c.title}</th>) :
              collections.map((c, i) => {
                if (i !== collections.length - 1) {
                  return (<th>{c.title}</th>)
                }
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
      <div className="data-sets">
        <select onChange={handleSelectDataSet}>
          <option default></option>
          {dataSets && dataSets.length && dataSets.map((set) => {return (<option>{set.title}</option>)})}
        </select>
      </div>
      {selectedDataSet && collections.length && renderTable()}
  </div>);
}

export default App;
