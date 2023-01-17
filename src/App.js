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
            <tr>{Object.values(item).map(val => {
              if (typeof val === "string" || typeof val === "number") {
                  return (
                  <td>
                    {val}
                  </td>
                  );
                }
              })}</tr>
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
        <tr>{(Object.values(caseObj.values)).map(val => {
          if (typeof val === "string" || typeof val === "number") {
              return (
              <td>
                {val}
              </td>
              );
            }
          })}</tr>
      )
    } else {
      return (
        <>
        <tr>
          {(Object.values(caseObj.values)).filter(val => typeof val === "string" || typeof val === "number").length > 1 ?
            <td>
              <table>
                <tbody>
                  <tr>{(Object.keys(caseObj.values)).map((key) => {
                    if (typeof caseObj.values[key] === "string" || typeof caseObj.values[key] === "number") {
                        return (
                        <th>
                          {key}
                        </th>
                        );
                      }
                    })}
                  </tr>
                  <tr>
                    {(Object.values(caseObj.values)).map((val) => {
                      if (typeof val === "string" || typeof val === "number") {
                          return (
                          <td>
                            {val}
                          </td>
                          );
                        }
                      })}
                  </tr>
                </tbody>
              </table>
            </td>
            :(Object.values(caseObj.values)).map((val) => {
            if (typeof val === "string" || typeof val === "number") {
                return (
                <td>
                  {val}
                </td>
                );
              }
            })
          }
          <td>
            <table className="sub-table">
              <tbody>
                {caseObj.children.map((child, i) => {
                  if (i === 0) {
                    return (
                      <>
                      <tr className="sub-header-row">
                        {((Object.keys(child.values)).map(key => <th>{key}</th>))}
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
    console.log("collections", collections);
    return (
      <table className="main-table">
        <tbody>
          <tr className="main-header-row">
            {
              collections.length === 1 ? <th>{collections[0].title}</th> :
              collections.filter((c, i) => i === 0 || i === 1).map((c) => <th>{c.title}</th>)
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
