import React from "react";
import { ICollection, INestedTableProps, IProcessedCaseObj, Values } from "../types";
import { DraggagleTableHeader } from "./draggable-table-tags";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";
import { TableHeaders } from "./table-headers";
import { TableCell } from "./table-cell";
import { useCodapContext } from "../hooks/useCodapContext";

import css from "./tables.scss";

export const LandscapeView = (props: INestedTableProps) => {
  const {collectionClasses, getClassName, getValueLength, paddingStyle} = props;
  const {collections, selectedDataSet, interactiveState} = useCodapContext();

  const renderNestedTable = (parentColl: ICollection) => {
    const headers = parentColl.cases.map((caseObj) => caseObj.values);
    const firstRowValues = parentColl.cases.map(caseObj => {
      return {...caseObj.values, id: caseObj.id} as Values;
    });
    const valueCount = getValueLength(firstRowValues);
    const className = getClassName(parentColl.cases[0]);
    const precisions = getAttrPrecisions(collections);
    const attrTypes = getAttrTypes(collections);
    const attrVisibilities = getAttrVisibility(collections);
    return (
      <>
        {interactiveState?.showHeaders &&
        <tr className={css[className]}>
          <th colSpan={valueCount}>{parentColl.name}</th>
        </tr> }
        <tr className={css[className]}>
          {headers.map((headerValues) => {
            return (
              <TableHeaders
                key={`hr-${headerValues.id}`}
                collectionId={parentColl.id}
                rowKey="first-row"
                values={headerValues}
                attrVisibilities={attrVisibilities}
              />
            );
          })}
        </tr>
        <tr className={css[className]}>
          {firstRowValues.map((values) => {
            return Object.keys(values).map((key, i) => {
              return (
                <TableCell
                  key={key}
                  index={i}
                  rowKey="first-row"
                  attributeName={key}
                  caseId={values.id}
                  collectionId={parentColl.id}
                  cellValue={values[key]}
                  attrType={attrTypes[key]}
                  precision={precisions[key]}
                  isHidden={attrVisibilities[key]}
                />
              );
            });
          }
          )}
        </tr>
        <tr className={css[className]}>
          {parentColl.cases.map((caseObj) => {
            return (
              <td
                width={`calc(100%/${parentColl.cases.length})`}
                key={`${caseObj.id}`}
                style={{...paddingStyle, verticalAlign: "top"}}
                colSpan={Object.values(caseObj.values).length}>
                <div style={{width: `100%`, overflow: "scroll"}}>
                  {renderColFromCaseObj(parentColl, caseObj)}
                </div>
              </td>
            );
          })}
        </tr>
      </>
    );
  };

  const renderColFromCaseObj = (collection: ICollection, caseObj: IProcessedCaseObj, index?: number) => {
    const {children, id, values} = caseObj;
    const caseValuesWithId: Values = {...values, id};
    const isFirstIndex = index === 0;
    const precisions = getAttrPrecisions(collections);
    const attrTypes = getAttrTypes(collections);
    const attrVisibilities = getAttrVisibility(collections);

    if (!children.length) {
      const className = getClassName(caseObj);
      return (
        <>
          {interactiveState?.showHeaders && isFirstIndex &&
            <tr className={css[className]}>
              <th colSpan={Object.keys(values).length}>{caseObj.collection.name}</th>
            </tr>
          }
          {isFirstIndex &&
            <tr className={css[className]}>
              <TableHeaders
                collectionId={collection.id}
                rowKey={`first-row-${index}`}
                values={caseValuesWithId}
                attrVisibilities={attrVisibilities}
              />
            </tr>
          }
          <tr>
            {Object.keys(caseValuesWithId).map((key, i) => {
              return (
                <TableCell
                  key={`${caseValuesWithId}-${i}`}
                  index={i}
                  caseId={`${caseValuesWithId.id}`}
                  attributeName={key}
                  rowKey={`row-${index}`}
                  collectionId={collection.id}
                  cellValue={caseValuesWithId[key]}
                  attrType={attrTypes[key]}
                  precision={precisions[key]}
                  isHidden={attrVisibilities[key]}
                />
              );
            })}
          </tr>
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
                  return renderColFromCaseObj(collection, child, i);
              })
            }
          </tbody>
        </table>
      );
    }
  };

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent);
    const firstRowValues = parentColl[0].cases.map((caseObj: IProcessedCaseObj )=> caseObj.values);
    const {className} = collectionClasses[0];

    return (
      <table className={`${css.mainTable} ${css.landscapeTable} ${css.landscape} ${css[className]}`}>
        <tbody>
        <tr className={css.mainHeader}>
          <DraggagleTableHeader
            collectionId={parentColl[0].id}
            attrTitle={selectedDataSet.name}
            colSpan={getValueLength(firstRowValues)}
            dataSetName={selectedDataSet.name}
            dataSetTitle={selectedDataSet.title}
          >
            {selectedDataSet.name}
          </DraggagleTableHeader>
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
