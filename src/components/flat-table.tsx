import React from "react";
import { CaseValuesWithId, ITableProps } from "../types";
import { DraggableTableContainer, DraggagleTableHeader } from "./draggable-table-tags";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";

import css from "./tables.scss";

interface IFlatProps extends ITableProps {
  cases: CaseValuesWithId[]
}

export const FlatTable = (props: IFlatProps) => {
  const {selectedDataSet, collections, collectionClasses, cases, mapCellsFromValues, showHeaders } = props;
  const collection = collections[0];
  const {className} = collectionClasses[0];
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

  return (
    <DraggableTableContainer collectionId="root">
      <table className={`${css.mainTable} ${css.flatTable} ${css[className]}}`}>
        <tbody>
          <tr className={css.mainHeader}>
            <th colSpan={cases.length}>{selectedDataSet.title}</th>
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
                dataSetName={selectedDataSet.name}
                dataSetTitle={selectedDataSet.title}
              >
                {attr.title}
              </DraggagleTableHeader>)}
          </tr>
          {orderedCases.map((c, index) => {
            return (
              <tr key={`${index}-${c.id}`}>
                {mapCellsFromValues(collection.id, `row-${index}`, c, precisions, attrTypes, attrVisibilities )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
};
