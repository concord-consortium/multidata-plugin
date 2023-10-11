import React from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";

import css from "./tables.scss";

export type PortraitViewRowProps =
  {collectionId: number, caseObj: IProcessedCaseObj, index?: null|number} & ITableProps;

export const PortraitViewRow = (props: PortraitViewRowProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders,
    getClassName, collectionId, caseObj, index} = props;

  const {children, values} = caseObj;

  if (!children.length) {
    return (
        <tr>{mapCellsFromValues(collectionId, `row-${index}`, values)}</tr>
    );
  } else {
    return (
      <>
        {index === 0 &&
          <tr className={`${css[getClassName(caseObj)]}`}>
            {mapHeadersFromValues(collectionId, `first-row-${index}`, values)}
            {showHeaders && (
              <DroppableTableHeader collectionId={collectionId}>{children[0].collection.name}</DroppableTableHeader>
            )}
          </tr>
        }
        <tr className={`${css[getClassName(caseObj)]}`}>
          {mapCellsFromValues(collectionId, `parent-row-${index}`, values)}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
                      ...props,
                      collectionId: child.collection.id,
                      caseObj: child,
                      index: i
                    };
                    if (i === 0 && !child.children.length) {
                      return (
                        <React.Fragment key={child.collection.id}>
                          <tr className={`${css[getClassName(child)]}`}>
                            {mapHeadersFromValues(child.collection.id, `child-row-${index}-${i}`, child.values)}
                          </tr>
                          <PortraitViewRow {...nextProps} />
                        </React.Fragment>
                      );
                    } else {
                      return <PortraitViewRow key={child.id} {...nextProps} />;
                    }
                  })}
                </tbody>
              </table>
            </DraggableTableContainer>
          </DroppableTableData>
        </tr>
      </>
    );
  }
};

export const PortraitView = (props: ITableProps) => {
  const {collectionClasses, selectedDataSet, collections, getValueLength} = props;

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const {className} = collectionClasses[0];
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);

    return (
      <DraggableTableContainer>
        <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`}>
          <tbody>
            <tr className={css.mainHeader}>
              <th colSpan={valueCount}>{selectedDataSet.name}</th>
            </tr>
            <tr className={css[className]}>
              <th colSpan={valueCount}>{parentColl.name}</th>
            </tr>
            {parentColl.cases.map((caseObj, index) => (
              <PortraitViewRow
                key={caseObj.id}
                {...props}
                collectionId={caseObj.collection.id}
                caseObj={caseObj}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </DraggableTableContainer>
    );
  };

  return (
    <div className={css.portaitTableContainer}>
      {collections.length && collectionClasses.length && renderTable()}
    </div>
  );
};
