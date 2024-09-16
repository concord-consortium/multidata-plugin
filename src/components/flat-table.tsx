import React from "react";
import { CaseValuesWithId, ITableProps } from "../types";
import { DraggableTableContainer, DraggagleTableHeader } from "./draggable-table-tags";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";
import { TableCell } from "./table-cell";
import { useCodapContext } from "./CodapContext";

import css from "./tables.scss";

export const FlatTable = (props: ITableProps) => {
  const { cases, collections, interactiveState, selectedDataSet } = useCodapContext();
  const showHeaders = interactiveState?.showHeaders;
  const collection = collections[0];
  const className = "collections0";
  const attrVisibilities = getAttrVisibility(collections);
  const collectionAttrsToUse = collection.attrs.filter(attr => !attrVisibilities[attr.title]);
  const titles = collectionAttrsToUse.map(attr => attr.title);
  const precisions = getAttrPrecisions(collections);
  const attrTypes = getAttrTypes(collections);
  const orderedCases = cases.map(c => {
    const orderedCase: CaseValuesWithId = {id: c.id};
    titles.forEach(title => {
      orderedCase[title] = c.values[title];
    });
    return orderedCase;
  });

  console.log("I am the FlatTable rendering");

  return (
    <DraggableTableContainer collectionId="root">
      <table className={`${css.mainTable} ${css.flatTable} ${css[className]}}`}>
        <tbody>
          <tr className={css.mainHeader}>
            <th colSpan={cases.length}>{selectedDataSet?.title}</th>
          </tr>
          {showHeaders &&
          <tr className={css[className]}>
            <th colSpan={cases.length}>{collections[0].title}</th>
          </tr>}
          <tr>
            {collectionAttrsToUse.map((attr: any) =>
              <DraggagleTableHeader
                key={attr.title}
                collectionId={collection.id}
                attrTitle={attr.title}
                dataSetName={selectedDataSet?.name}
                dataSetTitle={selectedDataSet?.title}
              >
                {attr.title}
              </DraggagleTableHeader>)}
          </tr>
          {orderedCases.map((c, index) => {
            return (
              <tr key={`${index}-${c.id}`}>
                {Object.keys(c).map((key, i) => {
                  return (
                    <TableCell
                      key={`${i}-${c.id}-${key}`}
                      collectionId={collection.id}
                      rowKey={`${index}-${c.id}`}
                      index={i}
                      caseId={`${c.id}`}
                      attributeName={key}
                      cellValue={c[key]}
                      precision={precisions[key]}
                      attrType={attrTypes[key]}
                      isHidden={attrVisibilities[key]}
                      isParent={false}
                    />
                  )

                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
};
