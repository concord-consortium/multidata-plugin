import { ReactNode } from "react";

export type PropsWithChildren<P> = P & { children?: ReactNode | ReactNode[] };

export interface IDataSet {
  guid: number,
  id: number,
  name: string,
  title: string
}

export interface ICollection {
  areParentChildLinksConfigured: boolean,
  attrs: Array<any>,
  caseName: string,
  cases: Array<IProcessedCaseObj>,
  childAttrName: string,
  collapseChildren: boolean,
  defaults: any,
  guid: number,
  id: number,
  labels: any,
  name: string,
  parent: number,
  title: string,
  type: string
}

export type ICollections = Array<ICollection>;

export interface ICaseObjCommon {
  collection: {
    name: string,
    id: number
  },
  id: number,
  parent: number,
  values: Values
}

export type Values = Record<string, any>;

export type CaseValuesWithId = Values & {
  id: number
};

export interface ICaseObj extends ICaseObjCommon {
  children: Array<number>
}

export interface IProcessedCaseObj extends ICaseObjCommon {
  children: Array<IProcessedCaseObj>
}

export interface ICollectionClass {
  collectionName: string;
  className: string;
}

export interface ITableProps {
  dataSetName: string;
  showHeaders: boolean;
  collectionClasses: Array<ICollectionClass>;
  getClassName: (caseObj: IProcessedCaseObj) => string;
  selectedDataSet: IDataSet;
  collections: Array<ICollection>;
  mapCellsFromValues: (collectionId: number, rowKey: string, caseValuesWithId: Values,
      precisions: Record<string, number>, attrTypes: Record<string, string | undefined | null>,
      attrVisibilities: Record<string, boolean>, isParent?: boolean, resizeCounter?: number,
      parentLevel?: number) => ReactNode | ReactNode[];
  mapHeadersFromValues?: (collectionId: number, rowKey: string, values: Values,
      attrVisibilities: Record<string, boolean>, 
      renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>,
      isParent?: boolean, attrId?: number, editableHasFocus?: boolean ) => ReactNode | ReactNode[];
  getValueLength: (firstRow: Array<Values>) => number;
  paddingStyle: Record<string, string>;
  handleAddAttribute?: (collection: ICollection, attrName: string) => Promise<void>;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
}

export interface IBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface InteractiveState {
  view: "nested-table" | "hierarchy" | "card-view" | null
  dataSetName: string|null;
  padding: boolean;
  showHeaders: boolean;
  displayMode: string;
}

export type CodapState = {
  init: () => Promise<void>,
  handleSelectSelf: () => Promise<void>,
  dataSets: IDataSet[],
  selectedDataSet: any,
  collections: ICollections,
  handleSetCollections: (collections: ICollections) => void,
  handleSelectDataSet: (name: string) => void,
  getCollectionNameFromId: (id: number) => string | undefined,
  updateInteractiveState: (update: Partial<InteractiveState>) => void,
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
  handleUpdateCollections: () => Promise<void>,
  addAttributeToCollection: (collectionId: number, attrName: string) => Promise<void>,
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>,
};