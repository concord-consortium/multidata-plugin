import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { ICollection, ITableProps } from "../../../types";
import { DraggableTableContainer } from "../common/draggable-table-tags";
import { TableScrollTopContext, useTableScrollTop } from "../../../hooks/useTableScrollTop";
import { AddAttributeButton } from "../common/add-attribute-button";
import { TableHeaderFocusContext } from "../../../hooks/useTableHeaderFocusContext";
import { PortraitTableRow } from "./portrait-table-row";

import css from "../common/tables.scss";

export const PortraitTable = observer(function PortraitView(props: ITableProps) {
  const {collectionClasses, collectionsModel, selectedDataSet, getValueLength, dataSetName,
    handleAddAttribute} = props;
  const { collections } = collectionsModel;
  const tableRef = useRef<HTMLTableElement | null>(null);
  const tableScrollTop = useTableScrollTop(tableRef);

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const {className} = collectionClasses[0];
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
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
                <PortraitTableRow
                  key={caseObj.id}
                  {...props}
                  caseObj={caseObj}
                  index={index}
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
