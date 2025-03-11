import React, { useEffect, useRef } from "react";
import { IProcessedCaseObj, ITableProps } from "../../../types";
import { observer } from "mobx-react-lite";
import { TableCells } from "../common/table-cells";
import { TableHeaders } from "../common/table-headers";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "../common/draggable-table-tags";

import css from "../common/tables.scss";

const kTableHeaderHeight = 60;
const kParentLevelHeight = 20;

export type PortraitTableRowProps = {
  caseObj: IProcessedCaseObj, index?: null | number,
  isParent: boolean, parentLevel?: number
  dataSetName: string, getsFocusOnAddAttr?: boolean
} & ITableProps;

export const PortraitTableRow = observer(function PortraitTableRow(props: PortraitTableRowProps) {
  const { paddingStyle, showHeaders, getClassName, caseObj, index, isParent, parentLevel = 0, dataSetName,
    handleAddAttribute, collectionsModel, renameAttribute, editCaseValue,
    selectedDataSet, getsFocusOnAddAttr, tableIndex, selectCases, selectionList } = props;
  const { collections, attrVisibilities, attrPrecisions, attrTypes } = collectionsModel;
  const collectionId = caseObj.collection.id;
  const { children, id, values } = caseObj;
  const selectedCase = selectionList?.some(sCase => sCase.caseID === id);
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (selectedCase && rowRef.current) {
      // Offset for the table header and each parent level
      const offset = kTableHeaderHeight + (kParentLevelHeight * parentLevel);
      const top = rowRef.current.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });    }
  }, [parentLevel, selectedCase]);

  const handleSelectCase = (caseIds: number | number[], e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    selectCases?.(Array.isArray(caseIds) ? caseIds : [caseIds]);
  };

  if (!children.length) {
    return (
      <tr ref={rowRef} className={`${selectedCase ? css.selected : ""}`}
          onClick={(e)=>handleSelectCase(caseObj.id, e)}>
        <TableCells
          collectionId={collectionId}
          rowKey={`row-${index}`}
          cCase={caseObj}
          precisions={attrPrecisions}
          attrTypes={attrTypes}
          attrVisibilities={attrVisibilities}
          isParent={false}
          parentLevel={parentLevel}
          selectedDataSetName={dataSetName}
          editCaseValue={editCaseValue}
          onSelectCase={handleSelectCase}
          selectionList={selectionList}
        />
      </tr>
    );
  } else {
    return (
      <>
        {index === 0 &&
          <tr className={`${css[getClassName(caseObj)]}`}>
            <TableHeaders
              caseId={id}
              collectionId={collectionId}
              rowKey={`first-row-${index}`}
              values={values}
              attrVisibilities={attrVisibilities}
              isParent={true}
              attrId={id}
              editableHasFocus={getsFocusOnAddAttr}
              selectedDataSet={selectedDataSet}
              renameAttribute={renameAttribute}
            />
            {showHeaders ? (
              <DroppableTableHeader
                collectionId={collectionId}
                collections={collections}
                childCollectionId={caseObj.children[0].collection.id}
                dataSetName={dataSetName}
                handleAddAttribute={handleAddAttribute}
                tableIndex={tableIndex}
              >
                {children[0].collection.name}
              </DroppableTableHeader>
            ) : <th />}
          </tr>
        }
        <tr ref={rowRef} className={`${css[getClassName(caseObj)]} parent-row ${selectedCase ? css.selected : ""}`}
            onClick={(e)=>handleSelectCase(caseObj.id, e)}>
          <TableCells
            collectionId={collectionId}
            rowKey={`parent-row-${index}`}
            cCase={caseObj}
            precisions={attrPrecisions}
            attrTypes={attrTypes}
            attrVisibilities={attrVisibilities}
            isParent={isParent}
            parentLevel={parentLevel}
            selectedDataSetName={dataSetName}
            editCaseValue={editCaseValue}
            selectionList={selectionList}
          />
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer caseId={id} collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitTableRowProps = {
                      ...props,
                      caseObj: child,
                      index: i,
                      isParent: true,
                      parentLevel: parentLevel + 1,
                      getsFocusOnAddAttr: getsFocusOnAddAttr && i === 0
                    };
                    if (i === 0 && !child.children.length) {
                      return (
                        <React.Fragment key={child.collection.id}>
                          <tr className={`${css[getClassName(child)]}`}>
                            <TableHeaders
                              caseId={child.id}
                              collectionId={child.collection.id}
                              rowKey={`child-row-${index}-${i}`}
                              values={child.values}
                              attrVisibilities={attrVisibilities}
                              isParent={false}
                              attrId={child.id}
                              editableHasFocus={getsFocusOnAddAttr}
                              selectedDataSet={selectedDataSet}
                              renameAttribute={renameAttribute}
                            />
                          </tr>
                          <PortraitTableRow {...nextProps} />
                        </React.Fragment>
                      );
                    } else {
                      return <PortraitTableRow key={child.id} {...nextProps} />;
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
