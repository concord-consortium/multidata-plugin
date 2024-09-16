import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { ICollection, ICollections, IDataSet } from "../types";
import { InteractiveState, useCodapState } from "../hooks/useCodapState";

export type CodapState = {
  init: () => Promise<void>,
  handleSelectSelf: () => Promise<void>,
  dataSets: IDataSet[],
  selectedDataSet: any,
  collections: ICollections,
  handleSetCollections: (collections: ICollections) => void,
  handleSelectDataSet: (name: string) => void,
  getCollectionNameFromId: (id: number) => string | undefined,
  handleUpdateInteractiveState: (update: Partial<InteractiveState>) => void,
  interactiveState: InteractiveState,
  cases: any[],
  connected: boolean,
  handleUpdateAttributePosition: (coll: ICollection, attrName: string, position: number) => Promise<void>,
  handleAddCollection: (newCollectionName: string) => Promise<void>,
  handleSortAttribute: (context: string, attrId: number, isDescending: boolean) => Promise<void>,
  handleAddAttribute: (collection: ICollection, attrName: string) => Promise<void>,
  updateTitle: (title: string) => Promise<void>,
  selectCODAPCases: (caseIds: number[]) => Promise<void>,
  listenForSelectionChanges: (callback: (notification: any) => void) => void,
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>,
  handleUpdateCollections: () => Promise<void>
};

const CodapContext = createContext({} as CodapState);


export const useCodapContext = () => {
  return useContext(CodapContext);
};

export const CodapProvider = ({ children }: { children: ReactNode }) => {
  const codapState = useCodapState(); // Now useCodapState is called here

  useEffect(() => {
    codapState.init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!codapState.connected) {
    return <div>Loading...</div>;  // Handle loading state in the provider itself
  }

  return (
    <CodapContext.Provider value={codapState}>
      {children}
    </CodapContext.Provider>
  );
};
