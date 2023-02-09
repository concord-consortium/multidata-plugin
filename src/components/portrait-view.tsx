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

export const PortraitView = (props: IProps) => {
  const {paddingStyle, showHeaders, collectionClasses, getClassName, selectedDataSet, collections} = props;

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
    const parentColl = collections.filter((coll: ICollection) => !coll.parent);
    return (
      <table className={`main-table ${collectionClasses[0].className}`}>
        <tbody>
          <tr className={`${collectionClasses[0].className}`}>
            <th colSpan={collections.length}>{collections[0].title}</th>
          </tr>
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
