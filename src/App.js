import React, {useEffect} from 'react';
import './App.css';
import { useCodapState } from './hooks/useCodapState';
import { connect } from './scripts/connect';

function App() {
  const { dataSets, selectedDataSet, collections, handleSelectDataSet, itemCount, getCollectionNameFromId } = useCodapState();

  useEffect(() => {
    console.log("collectionDetails", collections);
  }, [collections])

  return (
    <div>

      <div className="data-sets">
        <select onChange={handleSelectDataSet}>
          <option default></option>
          {dataSets && dataSets.length && dataSets.map((set) => {return (<option>{set.name}</option>)})}
        </select>
      </div>

      <div className="selected-data-set">
          You have selected: <b>{selectedDataSet}</b>
      </div>

      <div className="table">
        <div className="title">{selectedDataSet}</div>
        <div className="table-body">
          { !!collections.length &&
            <div className="collections">
              {collections.map((c) => {
                return (
                  <div>
                    <p><b>{c.name}</b></p>
                    {c.parent && <p>Parent: {(getCollectionNameFromId(c.parent))}</p>}
                    <p>Cases:</p> {c.cases.map((collCase) => {
                      return (
                        <ul>
                          <li>{JSON.stringify(Object.values(collCase.values)[0])}
                            <ul>
                              {collCase.children && collCase.children.map((child) => {
                                return (<li>{child["Mammal"]}</li>);
                              })}
                            </ul>
                          </li>
                        </ul>
                      )})}
                  </div>
                )})}
              <p>Number of items in this dataset: {itemCount}</p>
            </div> }
        </div>
      </div>
  </div>);
}

export default App;
