import React from "react";
import { ITableProps } from "../types";

import css from "./tables.scss";

interface IFlatProps extends ITableProps {
  items: Array<any>
}

export const FlatTable = (props: IFlatProps) => {
  const {selectedDataSet, collections, collectionClasses, items, mapCellsFromValues, showHeaders,
          handleShowComponent} = props;
  const collection = collections[0];
  const {className} = collectionClasses[0];

  return (
    <table className={`${css.mainTable} ${css.flatTable} ${css[className]}}`} onClick={handleShowComponent}>
      <tbody>
        <tr className={css.mainHeader}>
          <th colSpan={items.length}>{selectedDataSet.title}</th>
        </tr>
        {showHeaders &&
        <tr className={css[className]}>
          <th colSpan={items.length}>{collections[0].title}</th>
        </tr>}
        <tr>
          {collection.attrs.map((attr: any) => <th key={attr.title}>{attr.title}</th>)}
        </tr>
        {items.length && items.map((item) => {
          return (
            <tr key={`${item.id}`}>{mapCellsFromValues(item)}</tr>
          );
        })}
      </tbody>
    </table>
  );
};
