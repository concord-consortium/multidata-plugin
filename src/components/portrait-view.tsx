import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";
import { TableScrollTopContext, useTableScrollTop } from "../hooks/useTableScrollTop";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";
import { AddAttributeButton } from "./add-attribute-button";
import { TableHeaders } from "./table-headers";
import { TableHeaderFocusContext, useTableHeaderFocusContext } from "../hooks/useTableHeaderFocusContext";

import css from "./tables.scss";

export type PortraitViewRowProps = {caseObj: IProcessedCaseObj, index?: null|number,
                                    precisions: Record<string, number>,
                                    attrTypes: Record<string, string | undefined | null>,
                                    attrVisibilities: Record<string, boolean>,
                                    isParent: boolean, parentLevel?: number
                                    dataSetName: string, hasFocusBeenSet?: boolean} & ITableProps;

export const PortraitViewRow = observer(function PortraitViewRow(props: PortraitViewRowProps) {
  const {paddingStyle, mapCellsFromValues, showHeaders, precisions, attrTypes, attrVisibilities,
         getClassName, caseObj, index, isParent, parentLevel = 0, dataSetName,
         handleAddAttribute, collections, handleSortAttribute, renameAttribute,
         hasFocusBeenSet} = props;
  const collectionId = caseObj.collection.id;
  const {focusSetForLevels, updateFocusSetForLevel} = useTableHeaderFocusContext();
  const {children, id, values} = caseObj;
  const focusSetForLevel = !!parentLevel && focusSetForLevels.get(parentLevel);
  const shouldGetFocusOnNewAttribute = !focusSetForLevel;
  if (!focusSetForLevel) {
    updateFocusSetForLevel?.(parentLevel || 0);
  }

  if (!children.length) {
    return (
      <tr>
        {mapCellsFromValues(collectionId, `row-${index}`, caseObj, precisions, attrTypes, attrVisibilities)}
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
              editableHasFocus={shouldGetFocusOnNewAttribute}
              selectedDataSet={props.selectedDataSet}
              handleSortAttribute={handleSortAttribute}
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
            collectionId, `parent-row-${index}`, caseObj, precisions, attrTypes, attrVisibilities,
            isParent, parentLevel
          )}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
                      ...props,
                      caseObj: child,
                      index: i,
                      isParent,
                      parentLevel: parentLevel + 1,
                      hasFocusBeenSet: hasFocusBeenSet || shouldGetFocusOnNewAttribute
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
                              attrId={child.id}
                              editableHasFocus={shouldGetFocusOnNewAttribute}
                              selectedDataSet={props.selectedDataSet}
                              handleSortAttribute={handleSortAttribute}
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
});

export const PortraitView = observer(function PortraitView(props: ITableProps) {
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
    const focusSetForLevels = new Map<number, boolean>();

    const updateFocusSetForLevel = (level: number) => {
      focusSetForLevels.set(level, true);
    };

    return (
      <TableHeaderFocusContext.Provider value={{ focusSetForLevels, updateFocusSetForLevel }}>
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
      </TableHeaderFocusContext.Provider>
    );
  };

  return (
      <TableScrollTopContext.Provider value={tableScrollTop}>
        <div className={css.portraitTableContainer}>
          {collections.length && collectionClasses.length && renderTable()}
        </div>
      </TableScrollTopContext.Provider>
  );
});
