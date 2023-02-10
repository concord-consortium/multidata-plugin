import React from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import "./landscape-view.css";

export const LandscapeView = (props: ITableProps) => {
  const {mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections} = props;

  const renderNestedTable = (parentColl: ICollection) => {
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    let valueCount = 0;
    firstRowValues.forEach((values) => {
      const valuesLength = Object.entries(values).length;
      valueCount += valuesLength;
    });
    return (
      <>
        {showHeaders &&
        <tr className={`${getClassName(parentColl.cases[0])}`}>
          <th colSpan={valueCount}>{parentColl.name}</th>
        </tr> }
        <tr className={`${getClassName(parentColl.cases[0])}`}>
          {firstRowValues.map(values => mapHeadersFromValues(values))}
        </tr>
        <tr>{firstRowValues.map(values => mapCellsFromValues(values))}</tr>
        <tr>
          {parentColl.cases.map((caseObj) => {
            return (
              <td
                width={`calc(100%/${parentColl.cases.length})`}
                key={`${caseObj.id}`}
                style={{verticalAlign: "top"}}
                colSpan={Object.values(caseObj.values).length}>
                <div style={{width: `100%`, overflow: "scroll"}}>
                  {renderColFromCaseObj(caseObj)}
                </div>
              </td>
            );
          })}
        </tr>
      </>
    );
  };

  const renderColFromCaseObj = (caseObj: IProcessedCaseObj, index?: number) => {
    const {children, values} = caseObj;
    const isFirstIndex = index === 0;
    if (!children.length) {
      return (
        <>
          {showHeaders && isFirstIndex &&
            <tr className={`${getClassName(caseObj)}`}>
              <th colSpan={Object.keys(values).length}>{caseObj.collection.name}</th>
            </tr>
          }
          {isFirstIndex && <tr className={`${getClassName(caseObj)}`}>{mapHeadersFromValues(values)}</tr>}
          <tr>{mapCellsFromValues(values)}</tr>
        </>
      );
    } else {
      const anyChildHasChildren = caseObj.children.filter((child) => child.children.length).length > 0;
      const childrenCollection = collections.filter((coll) => coll.name === caseObj.children[0].collection.name)[0];
      const relevantCases = childrenCollection.cases.filter((child) => child.parent === caseObj.id);
      const filteredCollection = {...childrenCollection, cases: relevantCases};
      const className = getClassName(caseObj.children[0]);
      return (
        <table className={`sub-table ${className} ${!anyChildHasChildren ? "scrollable" : "landscape"}`}>
          <tbody>
            {anyChildHasChildren ?
              renderNestedTable(filteredCollection) :
              caseObj.children.map((child: IProcessedCaseObj, i: number) => {
                  return renderColFromCaseObj(child, i);
              })
            }
          </tbody>
        </table>
      );
    }
  };

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent);
    return (
      <table className={`main-table landscape ${collectionClasses[0].className}`}>
        <tbody>
          {renderNestedTable(parentColl[0])}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {selectedDataSet && collections.length && collectionClasses.length && renderTable()}
    </div>
  );
};
