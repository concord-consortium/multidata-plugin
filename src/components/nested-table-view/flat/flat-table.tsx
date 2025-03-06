import React, { useEffect, useRef } from "react";
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
  const {selectedDataSet, collectionsModel, collectionClasses, showHeaders, selectCases, selectionList,
         editCaseValue, renameAttribute, handleAddAttribute } = props;
  const { collections, attrVisibilities, attrPrecisions, attrTypes } = collectionsModel;
  const collection = collectionsModel.collections[0];
  const {className} = collectionClasses[0];
  const collectionAttrsToUse = collection.attrs.filter(attr => !attrVisibilities[attr.title]);
  const titles = collectionAttrsToUse.map(attr => attr.title);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    const selectedCase = selectionList?.find(sCase => rowRefs.current.has(sCase.caseID));
    if (selectedCase) {
      const row = rowRefs.current.get(selectedCase.caseID);
      if (row) {
        const top = row.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [selectionList]);

    const handleSelectCase = (caseIds: number | number[], e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      selectCases?.(Array.isArray(caseIds) ? caseIds : [caseIds]);
    };

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
            const isSelected = selectionList?.some(sCase => sCase.caseID === c.id);
            return (
              <tr key={`${index}-${c.id}`} className={`${isSelected ? css.selected : ""}`}
                ref={el => {
                  if (el) {
                    rowRefs.current.set(c.id, el);
                  } else {
                    rowRefs.current.delete(c.id);
                  }
                }}
              >
                <TableCells
                  collectionId={collection.id}
                  rowKey={`row-${index}`}
                  cCase={c}
                  precisions={attrPrecisions}
                  attrTypes={attrTypes}
                  attrVisibilities={attrVisibilities}
                  selectedDataSetName={selectedDataSet.name}
                  editCaseValue={editCaseValue}
                  onSelectCase={handleSelectCase}
                  selectionList={selectionList}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
});
