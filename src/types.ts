import { ReactNode } from "react";

export type PropsWithChildren<P> = P & { children?: ReactNode | ReactNode[] };

interface IAttribute {
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
  guid: number,
  id: number,
  name: string,
  title: string
}

export interface ICollection {
  areParentChildLinksConfigured: boolean,
  attrs: IAttribute[],
  caseName?: string,
  cases: IProcessedCaseObj[],
  childAttrName?: string,
  collapseChildren?: boolean,
  defaults?: any,
  guid: number,
  id: number,
  labels?: any,
  name: string,
  parent?: number,
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
  parent?: number,
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
  showHeaders: boolean,
  collectionClasses: Array<ICollectionClass>,
  getClassName: (caseObj: IProcessedCaseObj) => string,
  selectedDataSet: IDataSet,
  collections: ICollection[],
  mapCellsFromValues: (collectionId: number, rowKey: string, caseValuesWithId: Values,
      precisions: Record<string, number>, attrTypes: Record<string, string | undefined | null>,
      attrVisibilities: Record<string, boolean>, isParent?: boolean, resizeCounter?: number,
      parentLevel?: number) => ReactNode | ReactNode[],
  mapHeadersFromValues: (collectionId: number, rowKey: string, values: Values,
      attrVisibilities: Record<string, boolean>) => ReactNode | ReactNode[],
  getValueLength: (firstRow: Array<Values>) => number
  paddingStyle: Record<string, string>
  handleUpdateCollections: () => void
}

export interface IBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}
