import React from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggagleTableHeader } from "./draggable-table-header";

import css from "./tables.scss";

export const PortraitView = (props: ITableProps) => {
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
          <DraggagleTableHeader
            collectionId={parentColl.id}
            attrTitle={parentColl.name}
          >
            {parentColl.name}
          </DraggagleTableHeader>
        </tr>
        {parentColl.cases.map((caseObj, index) => renderRowFromCaseObj(caseObj.collection.id, caseObj, index))}
      </>
    );
  };

  const renderRowFromCaseObj = (collectionId: number, caseObj: IProcessedCaseObj, index?: null|number) => {
    const {children, values} = caseObj;
    if (!children.length) {
      return (
          <tr>{mapCellsFromValues(`row-${index}`, values)}</tr>
      );
    } else {
      return (
        <>
          {index === 0 ?
            <tr className={`${css[getClassName(caseObj)]}`}>
              {mapHeadersFromValues(collectionId, `first-row-${index}`, values)}
              <th>{showHeaders ? children[0].collection.name : ""}</th>
            </tr> : ""
          }
          <tr className={`${css[getClassName(caseObj)]}`}>
            {mapCellsFromValues(`parent-row-${index}`, values)}
            <td style={paddingStyle}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0 && !child.children.length) {
                      return (
                        <>
                          <tr key={child.collection.name} className={`${css[getClassName(child)]}`}>
                            {mapHeadersFromValues(child.collection.id, `child-row-${index}-${i}`, child.values)}
                          </tr>
                          {renderRowFromCaseObj(child.collection.id, child, i)}
                        </>
                      );
                    } else {
                      return (renderRowFromCaseObj(child.collection.id, child, i));
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
      <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`}>
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
