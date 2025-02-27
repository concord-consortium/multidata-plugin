import { IResult } from "@concord-consortium/codap-plugin-api";
import { CollectionsModelType } from "./models/collections";
import { ReactNode } from "react";

export type PropsWithChildren<P> = P & { children?: ReactNode | ReactNode[] };

export interface IAttribute {
  cid: string;
  deletable?: boolean;
  editable: boolean;
  guid: number;
  hidden: boolean;
  id: number;
  name: string;
  renamable?: boolean;
  title: string;
  type:string;
}
export interface IDataSet {
  guid: number;
  id: number;
  name: string;
  title: string;
}

export interface ICollection {
  areParentChildLinksConfigured: boolean;
  attrs: IAttribute[];
  caseName?: string;
  cases: IProcessedCaseObj[];
  childAttrName?: string;
  collapseChildren?: boolean;
  defaults?: any;
  guid: number;
  id: number;
  labels?: any;
  name: string;
  parent?: number;
  title: string;
  type: string;
}

export type ICollections = Array<ICollection>;

export interface ICaseObjCommon {
  collection: {
    name: string,
    id: number
  };
  id: number;
  parent?: number;
  values: Values;
}

export type Values = Map<string|number, any>;

export interface ICaseObj extends ICaseObjCommon {
  children: Array<number>;
}

export interface IProcessedCaseObj extends ICaseObjCommon {
  children: Array<IProcessedCaseObj>;
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
  collectionsModel: CollectionsModelType;
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
  getValueLength: (firstRow: Array<Values>) => number;
  paddingStyle: Record<string, string>;
  tableIndex?: number;
  activeTableIndex?: number;
  handleAddAttribute: (collection: ICollection, attrName: string, tableIndex: number) => Promise<void>;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
  codapSelectedCases?: ICaseObjCommon | undefined;
}

export interface IBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Data for draggables and droppables
export interface IDndData {
  type: string;
  collectionId?: number | string;
  attrTitle?: string;
}

export function isCollectionData(data?: Record<string, any>): data is IDndData {
  return data?.type === "collection";
}

export interface InteractiveState {
  dataSetName: string | null;
  displayMode: string;
  padding: boolean;
  showHeaders: boolean;
  view: "nested-table" | "hierarchy" | "card-view" | null;
}

export type CodapState = {
  addAttributeToCollection: (collectionId: number, attrName: string) => Promise<void>;
  cases: IProcessedCaseObj[];
  collections: ICollections;
  connected: boolean;
  dataSets: IDataSet[];
  getCollectionNameFromId: (id: number) => string | undefined;
  handleAddAttribute: (collection: ICollection, attrName: string) => Promise<void>;
  handleAddCollection: (newCollectionName: string) => Promise<void>;
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>;
  handleSelectDataSet: (name: string) => void;
  handleSelectSelf: () => Promise<void>;
  handleSetCollections: (collections: ICollections) => void;
  handleUpdateAttributePosition: (coll: ICollection, attrName: string, position: number) => Promise<void>;
  handleUpdateCollections: () => Promise<void>;
  init: () => Promise<void>;
  interactiveState: InteractiveState;
  listenForSelectionChanges: (callback: (notification: any) => void) => void;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
  selectCODAPCases: (caseIds: number[]) => Promise<void>;
  selectedDataSet: IDataSet | null;
  updateInteractiveState: (update: Partial<InteractiveState>) => void;
  updateTitle: (title: string) => Promise<void>;
};
