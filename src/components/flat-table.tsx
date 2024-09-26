import React from "react";
import { observer } from "mobx-react-lite";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DraggableTableHeader } from "./draggable-table-tags";
import { isNewAttribute, getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";
import { TableCell } from "./table-cell";
import { AddAttributeButton } from "./add-attribute-button";

import css from "./tables.scss";

interface IFlatProps extends ITableProps {
  cases: IProcessedCaseObj[]
  editCaseValue: (newValue: string, cCase: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
  handleSortAttribute: (context: string, attrId: number, isDescending: boolean) => void;
}

export const FlatTable = observer(function FlatTable(props: IFlatProps) {
  const {selectedDataSet, collections, collectionClasses, handleSortAttribute, showHeaders,
         editCaseValue, renameAttribute, handleAddAttribute } = props;
  const collection = collections[0];
  const {className} = collectionClasses[0];
  const attrVisibilities = getAttrVisibility(collections);
  const collectionAttrsToUse = collection.attrs.filter(attr => !attrVisibilities[attr.title]);
  const titles = collectionAttrsToUse.map(attr => attr.title);
  const precisions = getAttrPrecisions(collections);
  const attrTypes = getAttrTypes(collections);

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
                       handleSortAttribute={handleSortAttribute}
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
                {caseValuesKeys.map((key, i) => {
                  return (
                    <TableCell
                      key={`${i}-${c.id}-${key}`}
                      collectionId={collection.id}
                      rowKey={`${index}-${c.id}`}
                      index={i}
                      caseObj={c}
                      attributeName={String(key)}
                      cellValue={c.values.get(key)}
                      precision={precisions[key]}
                      attrType={attrTypes[key]}
                      isHidden={attrVisibilities[key]}
                      isParent={false}
                      selectedDataSet={selectedDataSet.name}
                      editCaseValue={editCaseValue}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
});
