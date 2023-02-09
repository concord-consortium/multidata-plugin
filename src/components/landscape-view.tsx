import React from "react";
import { ICollection, IDataSet, IProcessedCaseObj, IValues } from "../types";
import "./app.css";

interface ICollectionClass {
    collectionName: string;
    className: string;
}

interface IProps {
  paddingStyle: Record<string, string>,
  showHeaders: boolean,
  collectionClasses: Array<ICollectionClass>,
  getClassName: (caseObj: IProcessedCaseObj) => void,
  selectedDataSet: IDataSet,
  collections: Array<ICollection>
}

export const LandscapeView = (props: IProps) => {
  const {paddingStyle, showHeaders, collectionClasses, getClassName, selectedDataSet, collections} = props;

  const mapHeadersFromValues = (values: IValues, colSpan?: boolean) => {
    const span = colSpan ? Object.keys(values).length : undefined;
    return (
      <>
        {(Object.keys(values)).map((key, i) => {
          if (typeof values[key] === "string" || typeof values[key] === "number") {
              return (<th colSpan={span} key={i}>{key}</th>);
            }
          }
        )}
      </>
    );
  };

  const mapCellsFromValues = (values: IValues, colSpan?: boolean) => {
    const span = colSpan ? Object.values(values).length : undefined;
    return (
      <>
        {(Object.values(values)).map((val, i) => {
          if (typeof val === "string" || typeof val === "number") {
              return (<td colSpan={span} key={i}>{val}</td>);
            }
          }
        )}
      </>
    );
  };

  const renderNestedTable = (parentColl: ICollection) => {
    const firstRowValues = parentColl.cases.map((caseObj) => {return caseObj.values});
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
          {parentColl.cases.map((caseObj, i) => {
            return (
              <td
                width={`calc(100%/${parentColl.cases.length})`}
                key={`${caseObj.collection.name + i}`}
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
      return (
        <table className={`sub-table ${getClassName(caseObj.children[0])} ${!anyChildHasChildren ? "scrollable" : "landscape"}`}>
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
