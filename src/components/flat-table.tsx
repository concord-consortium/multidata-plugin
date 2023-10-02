import React from "react";
import { ITableProps } from "../types";
import { DraggagleTableHeader } from "./draggable-table-header";

import css from "./tables.scss";

interface IFlatProps extends ITableProps {
  items: Array<any>
}

export const FlatTable = (props: IFlatProps) => {
  const {selectedDataSet, collections, collectionClasses, items, mapCellsFromValues, showHeaders} = props;
  const collection = collections[0];
  const {className} = collectionClasses[0];

  return (
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
          {collection.attrs.map((attr: any) =>
            <DraggagleTableHeader
              key={attr.title}
              collectionId={collection.id}
              attrTitle={attr.title}
            >
              {attr.title}
            </DraggagleTableHeader>)}
        </tr>
        {items.map((item, index) => {
          return (
            <tr key={`${index}-${item.id}`}>{mapCellsFromValues(`row-${index}`, item)}</tr>
          );
        })}
      </tbody>
    </table>
  );
};
