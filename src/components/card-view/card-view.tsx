import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCodapState } from "../../hooks/useCodapState";
import { ICaseObjCommon, ICollection } from "../../types";
import { Menu } from "../menu";
import { CaseView } from "./case-view";

import css from "./card-view.scss";

interface ICardViewProps {
  onSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const CardView = (props: ICardViewProps) => {
  const { onSelectDataSet } = props;
  const { dataSets, selectedDataSet, collections, selectCODAPCases, listenForSelectionChanges,
    updateTitle } = useCodapState();
  const listeningToDataSetId = useRef(0);
  const [codapSelectedCase, setCodapSelectedCase] = useState<ICaseObjCommon|undefined>(undefined);

  const rootCollection = useMemo(() => {
    return collections.find((c: ICollection) => !c.parent);
  }, [collections]);

  const attrs = useMemo(() => {
    const result: Record<string, any> = {};
    collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        result[attr.name] = attr;
      });
    });
    return result;
  }, [collections]);

  useEffect(() => {
    if (selectedDataSet?.title) {
      updateTitle(`${selectedDataSet.title} Data`);
    }
  }, [selectedDataSet, updateTitle]);

  useEffect(() => {
    if (selectedDataSet && listeningToDataSetId.current !== selectedDataSet.id) {
      listenForSelectionChanges((notification) => {
        const result = notification?.values?.result;
        let newCase: ICaseObjCommon|undefined = undefined;
        if (result?.success && result.cases?.length >= 0) {
          newCase = result.cases[0];
        }
        setCodapSelectedCase(newCase);
      });
      listeningToDataSetId.current = selectedDataSet.id;
    }
  }, [selectedDataSet, listenForSelectionChanges, setCodapSelectedCase]);

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
      const parentCollection = collection ? collectionsById[collection.parent] : undefined;
      caseItem = parentCollection?.cases.find(c => c.id === parent) as ICaseObjCommon;
    }

    return result;
  }, [codapSelectedCase, collections]);

  if (!selectedDataSet || !rootCollection) {
    return (
      <Menu
        onSelectDataSet={onSelectDataSet}
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
        selectCases={selectCODAPCases}
        codapSelectedCaseLineage={codapSelectedCaseLineage}
      />
    </div>
  );
};

