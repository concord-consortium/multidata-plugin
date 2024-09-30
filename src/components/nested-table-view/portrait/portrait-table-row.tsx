import React from "react";
import { IProcessedCaseObj, ITableProps } from "../../../types";
import { observer } from "mobx-react-lite";
import { useTableHeaderFocusContext } from "../../../hooks/useTableHeaderFocusContext";
import { TableCells } from "../common/table-cells";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "../common/draggable-table-tags";

import css from "../common/tables.scss";
import { TableHeaders } from "../common/table-headers";

export type PortraitViewRowProps = {
  caseObj: IProcessedCaseObj, index?: null | number,
  isParent: boolean, parentLevel?: number
  dataSetName: string, hasFocusBeenSet?: boolean
} & ITableProps;

export const PortraitTableRow = observer(function PortraitViewRow(props: PortraitViewRowProps) {
  const { paddingStyle, showHeaders, getClassName, caseObj, index, isParent, parentLevel = 0, dataSetName,
    handleAddAttribute, collectionsModel, handleSortAttribute, renameAttribute, hasFocusBeenSet,
    editCaseValue, selectedDataSet } = props;
  const { collections, attrVisibilities, attrPrecisions, attrTypes } = collectionsModel;
  const collectionId = caseObj.collection.id;
  const { focusSetForLevels, updateFocusSetForLevel } = useTableHeaderFocusContext();
  const { children, id, values } = caseObj;
  const focusSetForLevel = !!parentLevel && focusSetForLevels.get(parentLevel);
  const shouldGetFocusOnNewAttribute = !focusSetForLevel;
  if (!focusSetForLevel) {
    updateFocusSetForLevel?.(parentLevel || 0);
  }

  if (!children.length) {
    return (
      <tr>
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
        />
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
              isParent={true}
              attrId={id}
              editableHasFocus={shouldGetFocusOnNewAttribute}
              selectedDataSet={selectedDataSet}
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
          />
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
                      ...props,
                      caseObj: child,
                      index: i,
                      isParent: true,
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
                              isParent={false}
                              attrId={child.id}
                              editableHasFocus={shouldGetFocusOnNewAttribute}
                              selectedDataSet={selectedDataSet}
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
