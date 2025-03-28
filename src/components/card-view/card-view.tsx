import React, { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { InteractiveState } from "../../hooks/useCodapState";
import { IDataSet, ICaseObjCommon, ICollection, ISelectedCase } from "../../types";
import { Menu } from "../menu";
import { CaseView } from "./case-view";
import { CollectionsModelType } from "../../models/collections";

import css from "./card-view.scss";

interface ICardViewProps {
  selectedDataSet: IDataSet | null;
  dataSets: IDataSet[];
  collectionsModel: CollectionsModelType;
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateTitle: (title: string) => Promise<void>
  selectCases: (caseIds: number[]) => Promise<void>
  selectedCase: ISelectedCase | undefined;
}

export const CardView = observer(function CardView(props: ICardViewProps) {
  const {collectionsModel, dataSets, selectedDataSet, updateTitle, selectCases,
         handleSelectDataSet, selectedCase} = props;

  const collections = collectionsModel.collections;
  const rootCollection = collectionsModel.rootCollection;
  const attrs = collectionsModel.attrs;
  const selectedCaseCollection = collectionsModel.collections.find(c => c.id === selectedCase?.collectionID);

  useEffect(() => {
    if (selectedDataSet?.title) {
      updateTitle(`${selectedDataSet.title} Data`);
    }
  }, [selectedDataSet, updateTitle]);

  // array of case ids from root collection down to selected case
  const codapSelectedCaseLineage = useMemo<number[]>(() => {
    if (!selectedCase) {
      return [];
    }

    const collectionsById = collections.reduce<Record<number,ICollection|undefined>>((acc, collection) => {
      acc[collection.id] = collection;
      return acc;
    }, {});

    const result: number[] = [];
    let caseItem: ICaseObjCommon|undefined = selectedCaseCollection?.cases.find(c => c.id === selectedCase.caseID);
    while (caseItem) {
      const {id, parent} = caseItem;
      result.unshift(id);

      const collection = collectionsById[caseItem.collection.id];
      const parentCollection = collection?.parent ? collectionsById[collection.parent] : undefined;
      caseItem = parentCollection?.cases.find(c => c.id === parent) as ICaseObjCommon;
    }

    return result;
  }, [collections, selectedCase, selectedCaseCollection?.cases]);

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
