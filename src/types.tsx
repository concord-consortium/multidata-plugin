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
  values: IValues
}

export type IValues = Record<string, any>;

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