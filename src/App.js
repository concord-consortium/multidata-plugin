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

  const renderSingleNestedTable = (parentCollection) => {
    return (
      <>
      {parentCollection.cases.map((collCase) => {
          const childHeaders = Object.keys(collCase.children[0]);
          return (
            <tr>
              <td>{Object.values(collCase.values)[0]}</td>
              <td>
                <table>
                  <tr>{childHeaders.map((header) => <th>{header}</th>)}</tr>
                  {collCase.children.map((child) => <tr>{Object.values(child.values).map(val => <td>{val}</td>)}</tr>)}
                </table>
              </td>
            </tr>
          )
        })}
      </>
    );
  }

  const renderMultiNestedTable = (parentColl) => {
    console.log("collections", collections);
  }

  const renderTable = () => {
    return (
      <table>
        <tr>
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
          collections.length === 2 ? renderSingleNestedTable(collections.filter(coll => !coll.parent)[0]) :
          renderMultiNestedTable(collections.filter(coll => !coll.parent)[0])
        }
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
