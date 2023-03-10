import React from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import css from "./portrait-view.scss";

interface IProps extends ITableProps {
  paddingStyle: Record<string, string>
}

export const PortraitView = (props: IProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections, getValueLength} = props;

  const renderNestedTable = (parentColl: ICollection) => {
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
    const {className} = collectionClasses[0];
    return (
      <>
        <tr className={css.mainHeader}>
          <th colSpan={valueCount}>{selectedDataSet.name}</th>
        </tr>
        <tr className={css[className]}>
          <th colSpan={valueCount}>{parentColl.name}</th>
        </tr>
        {parentColl.cases.map((caseObj, index) => renderRowFromCaseObj(caseObj, index))}
      </>
    );
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
            <tr className={`${css[getClassName(caseObj)]}`}>
              {mapHeadersFromValues(values)}
              <th>{showHeaders ? children[0].collection.name : ""}</th>
            </tr> : ""
          }
          <tr>
            {mapCellsFromValues(values)}
            <td style={paddingStyle}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0 && !child.children.length) {
                      return (
                        <>
                          <tr key={child.collection.name} className={`${css[getClassName(child)]}`}>
                            {mapHeadersFromValues(child.values)}
                          </tr>
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
    const {className} = collectionClasses[0];
    return (
      <table className={`${css.mainTable} ${css[className]}`}>
        <tbody>
          {renderNestedTable(parentColl[0])}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {collections.length && collectionClasses.length && renderTable()}
    </div>
  );
};
