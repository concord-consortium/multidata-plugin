import React from "react";
import { ITableProps, IValues } from "../types";
import { DraggableTableContainer, DraggagleTableHeader } from "./draggable-table-tags";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";

import css from "./tables.scss";

interface IFlatProps extends ITableProps {
  items: Array<any>
}

export const FlatTable = (props: IFlatProps) => {
  const {selectedDataSet, collections, collectionClasses, items, mapCellsFromValues, showHeaders} = props;
  const collection = collections[0];
  const {className} = collectionClasses[0];
  const attrVisibilities = getAttrVisibility(collections);
  const collectionAttrsToUse = collection.attrs.filter(attr => !attrVisibilities[attr.title]);

  const titles = collectionAttrsToUse.map(attr => attr.title);
  const precisions = getAttrPrecisions(collections);
  const attrTypes = getAttrTypes(collections);
  const orderedItems = items.map(item => {
    const orderedItem: IValues = {};
    titles.forEach(title => {
      orderedItem[title] = item[title];
    });
    return orderedItem;
  });

  return (
    <DraggableTableContainer collectionId="root">
      <table className={`${css.mainTable} ${css.flatTable} ${css[className]}}`}>
        <tbody>
          <tr className={css.mainHeader}>
            <th colSpan={items.length}>{selectedDataSet.title}</th>
          </tr>
          {showHeaders &&
          <tr className={css[className]}>
            <th colSpan={items.length}>{collections[0].title}</th>
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
          {orderedItems.map((item, index) => {
            return (
              <tr key={`${index}-${item.id}`}>
                {mapCellsFromValues(collection.id, `row-${index}`, item, precisions, attrTypes, attrVisibilities)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </DraggableTableContainer>
  );
};
