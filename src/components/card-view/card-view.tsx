import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { InteractiveState } from "../../hooks/useCodapState";
import { IDataSet, ICollections, ICaseObjCommon, ICollection } from "../../types";
import { Menu } from "../menu";
import { CaseView } from "./case-view";

import css from "./card-view.scss";

interface ICardViewProps {
  selectedDataSet: IDataSet | null;
  dataSets: IDataSet[];
  collections: ICollections;
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateTitle: (title: string) => Promise<void>
  selectCases: (caseIds: number[]) => Promise<void>
  codapSelectedCase: ICaseObjCommon|undefined;
}

export const CardView = observer(function CardView(props: ICardViewProps) {
  const {collections, dataSets, selectedDataSet, updateTitle, selectCases, codapSelectedCase,
         handleSelectDataSet} = props;

  const rootCollection = useMemo(() => {
    return collections.find((c: ICollection) => !c.parent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, collections.length]);

  const attrs = useMemo(() => {
    const result: Record<string, any> = {};
    collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        result[attr.name] = attr;
      });
    });
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, collections.length]);

  useEffect(() => {
    if (selectedDataSet?.title) {
      updateTitle(`${selectedDataSet.title} Data`);
    }
  }, [selectedDataSet, updateTitle]);

  // array of case ids from root collection down to selected case
  const codapSelectedCaseLineage = useMemo<number[]>(() => {
    if (!codapSelectedCase) {
      return [];
    }

    const collectionsById = collections.reduce<Record<number,ICollection|undefined>>((acc, collection) => {
      acc[collection.id] = collection;
      return acc;
    }, {});

    const result: number[] = [];
    let caseItem: ICaseObjCommon|undefined = codapSelectedCase;
    while (caseItem) {
      const {id, parent} = caseItem;
      result.unshift(id);

      const collection = collectionsById[caseItem.collection.id];
      const parentCollection = collection?.parent ? collectionsById[collection.parent] : undefined;
      caseItem = parentCollection?.cases.find(c => c.id === parent) as ICaseObjCommon;
    }

    return result;
  }, [codapSelectedCase, collections]);

  if (!selectedDataSet || !rootCollection) {
    return (
      <Menu
        dataSets={dataSets}
        selectedDataSet={selectedDataSet}
        handleSelectDataSet={handleSelectDataSet}
      />
    );
  }

  return (
    <div className={css.cardView}>
      <CaseView
        key={`${rootCollection.id}-${collections.length}`}
        cases={rootCollection.cases}
        attrs={attrs}
        level={0}
        selectCases={selectCases}
        codapSelectedCaseLineage={codapSelectedCaseLineage}
      />
    </div>
  );
});
