import React, { useRef } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";
import { TableScrollTopContext, useTableScrollTop } from "../hooks/useTableScrollTop";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";
import { AddAttributeButton } from "./add-attribute-button";
import { TableHeaders } from "./table-headers";

import css from "./tables.scss";

export type PortraitViewRowProps = {collectionId: number, caseObj: IProcessedCaseObj, index?: null|number,
                                    precisions: Record<string, number>,
                                    attrTypes: Record<string, string | undefined | null>,
                                    attrVisibilities: Record<string, boolean>,
                                    isParent: boolean, parentLevel?: number, dataSetName: string}
                                    & ITableProps;

export const PortraitViewRow = (props: PortraitViewRowProps) => {
  const {paddingStyle, mapCellsFromValues, showHeaders, precisions, attrTypes, attrVisibilities,
          getClassName, collectionId, caseObj, index, isParent, parentLevel, dataSetName,
          handleAddAttribute, collections, renameAttribute} = props;
  const {children, id, values} = caseObj;
  const caseValuesWithId = {...values, id};

  if (!children.length) {
    return (
      <tr>
        {mapCellsFromValues(collectionId, `row-${index}`, caseValuesWithId, precisions, attrTypes, attrVisibilities)}
      </tr>
    );
  } else {
    return (
      <>
        {index === 0 &&
          <tr className={`${css[getClassName(caseObj)]}`}>
            <TableHeaders
              collectionId={collectionId}
              rowKey={`first-row-${index}`}
              values={values}
              attrVisibilities={attrVisibilities}
              isParent={isParent}
              attrId={id}
              editableHasFocus={index === 0}
              selectedDataSet={props.selectedDataSet}
              renameAttribute={renameAttribute}
            />
            {showHeaders ? (
                <DroppableTableHeader
                  collectionId={collectionId}
                  collections={collections}
                  childCollectionId={caseObj.children[0].collection.id}
                  dataSetName={dataSetName}
                  handleAddAttribute={handleAddAttribute}
                >
                  {children[0].collection.name}
                </DroppableTableHeader>
              ) : <th />}
          </tr>
        }
        <tr className={`${css[getClassName(caseObj)]} parent-row`}>
          {mapCellsFromValues(
            collectionId, `parent-row-${index}`, caseValuesWithId, precisions, attrTypes, attrVisibilities,
            isParent, parentLevel
          )}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
                      ...props,
                      collectionId: child.collection.id,
                      caseObj: child,
                      index: i,
                      isParent,
                      parentLevel: parentLevel !== undefined && parentLevel !== null ? parentLevel + 1 : undefined,
                    };
                    if (i === 0 && !child.children.length) {
                      return (
                        <React.Fragment key={child.collection.id}>
                          <tr className={`${css[getClassName(child)]}`}>
                            <TableHeaders
                              collectionId={child.collection.id}
                              rowKey={`child-row-${index}-${i}`}
                              values={child.values}
                              attrVisibilities={attrVisibilities}
                              isParent={isParent}
                              attrId={id}
                              editableHasFocus={index === 0}
                              selectedDataSet={props.selectedDataSet}
                              renameAttribute={renameAttribute}
                            />
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
  const {collectionClasses, selectedDataSet, collections, getValueLength, dataSetName, handleAddAttribute} = props;
  const tableRef = useRef<HTMLTableElement | null>(null);
  const tableScrollTop = useTableScrollTop(tableRef);

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const {className} = collectionClasses[0];
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
    const precisions = getAttrPrecisions(collections);
    const attrTypes = getAttrTypes(collections);
    const attrVisibilities = getAttrVisibility(collections);

    return (
      <DraggableTableContainer>
        <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`} ref={tableRef}>
          <tbody className={`table-body ${css[className]}`}>
            <tr className={css.mainHeader}>
              <th className={css.datasetNameHeader} colSpan={valueCount}>{selectedDataSet.name}</th>
            </tr>
            <tr className={css[className]}>
              <th colSpan={valueCount}>
                <div className={css.parentCollHeader}>
                  {parentColl.name}
                  <AddAttributeButton
                    collectionId={parentColl.id}
                    collections={collections}
                    handleAddAttribute={handleAddAttribute}
                  />
                </div>
              </th>
            </tr>
            {parentColl.cases.map((caseObj, index) => (
              <PortraitViewRow
                key={caseObj.id}
                {...props}
                collectionId={caseObj.collection.id}
                caseObj={caseObj}
                index={index}
                precisions={precisions}
                attrTypes={attrTypes}
                attrVisibilities={attrVisibilities}
                isParent={true}
                parentLevel={0}
                dataSetName={dataSetName}
              />
            ))}
          </tbody>
        </table>
      </DraggableTableContainer>
    );
  };

  return (
    <TableScrollTopContext.Provider value={tableScrollTop}>
      <div className={css.portraitTableContainer}>
        {collections.length && collectionClasses.length && renderTable()}
      </div>
    </TableScrollTopContext.Provider>
  );
};
