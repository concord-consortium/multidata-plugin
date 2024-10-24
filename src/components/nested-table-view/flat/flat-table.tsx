import React from "react";
import { observer } from "mobx-react-lite";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { IProcessedCaseObj, ITableProps } from "../../../types";
import { DraggableTableContainer, DraggableTableHeader } from "../common/draggable-table-tags";
import { isNewAttribute } from "../../../utils/utils";
import { TableCells } from "../common/table-cells";
import { AddAttributeButton } from "../common/add-attribute-button";

import css from "../common/tables.scss";

interface IFlatProps extends ITableProps {
  cases: IProcessedCaseObj[]
  editCaseValue: (newValue: string, cCase: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
}

export const FlatTable = observer(function FlatTable(props: IFlatProps) {
  const {selectedDataSet, collectionsModel, collectionClasses, showHeaders,
         editCaseValue, renameAttribute, handleAddAttribute } = props;
  const { collections, attrVisibilities, attrPrecisions, attrTypes } = collectionsModel;
  const collection = collectionsModel.collections[0];
  const {className} = collectionClasses[0];
  const collectionAttrsToUse = collection.attrs.filter(attr => !attrVisibilities[attr.title]);
  const titles = collectionAttrsToUse.map(attr => attr.title);

  return (
    <DraggableTableContainer collectionId="root">
      <table className={`${css.mainTable} ${css.flatTable} ${css[className]}}`}>
        <tbody>
          <tr className={css.mainHeader}>
            <th colSpan={collection.cases.length}>{selectedDataSet.title}</th>
          </tr>
          {showHeaders &&
          <tr className={css[className]}>
            <th colSpan={collection.cases.length}>
              {collections[0].title}
              <AddAttributeButton
                collectionId={collection.id}
                collections={collections}
                handleAddAttribute={handleAddAttribute}
              />
            </th>
          </tr>}
          <tr>
            {collectionAttrsToUse.map((attr, index) => {
              const isEditable = isNewAttribute(attr.name, index, collectionAttrsToUse);
              return <DraggableTableHeader
                       key={attr.title}
                       collectionId={collection.id}
                       attrTitle={attr.title}
                       attrId={attr.id}
                       dataSetName={selectedDataSet.name}
                       dataSetTitle={selectedDataSet.title}
                       editableHasFocus={isEditable}
                       renameAttribute={renameAttribute}
                     >
                      {attr.title}
                     </DraggableTableHeader>;
            })}
          </tr>
          {collection.cases.map((c, index) => {
            const caseValuesKeys = [...c.values.keys()];
            // sort each case's values to match the order of `titles`
            caseValuesKeys.sort((a, b) => {
              return titles.indexOf(String(a)) - titles.indexOf(String(b));
            });
            return (
              <tr key={`${index}-${c.id}`}>
                <TableCells
                  collectionId={collection.id}
                  rowKey={`row-${index}`}
                  cCase={c}
                  precisions={attrPrecisions}
                  attrTypes={attrTypes}
                  attrVisibilities={attrVisibilities}
                  selectedDataSetName={selectedDataSet.name}
                  editCaseValue={editCaseValue}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
});
