import React from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import css from "./landscape-view.scss";

export const LandscapeView = (props: ITableProps) => {
  const {mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections, getValueLength} = props;

  const renderNestedTable = (parentColl: ICollection) => {
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
    const className = getClassName(parentColl.cases[0]);
    return (
      <>
        {showHeaders &&
        <tr className={css[className]}>
          <th colSpan={valueCount}>{parentColl.name}</th>
        </tr> }
        <tr className={css[className]}>
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
      const className = getClassName(caseObj);
      return (
        <>
          {showHeaders && isFirstIndex &&
            <tr className={css[className]}>
              <th colSpan={Object.keys(values).length}>{caseObj.collection.name}</th>
            </tr>
          }
          {isFirstIndex && <tr className={css[className]}>{mapHeadersFromValues(values)}</tr>}
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
        <table className={`${css.subTable} ${css[className]} ${!anyChildHasChildren ? css.scrollable : css.landscape}`}>
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
    const firstRowValues = parentColl[0].cases.map(caseObj => caseObj.values);
    const {className} = collectionClasses[0];

    return (
      <table className={`${css.mainTable} ${css.landscape} ${css[className]}`}>
        <tbody>
        <tr className={css.mainHeader}>
          <th colSpan={getValueLength(firstRowValues)}>{selectedDataSet.name}</th>
        </tr>
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
