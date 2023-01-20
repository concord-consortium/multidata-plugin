interface IDataSet {}

interface ICollection {
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

type ICollections = Array<ICollection>

interface IItem {}

interface ICaseObjCommon {
  collection: {
    name: string,
    id: number
  },
  id: number,
  parent: number,
  values: IValues
}

type IValues = Record<string, any>;

interface ICaseObj extends ICaseObjCommon {
  children: Array<number>
}

interface IProcessedCaseObj extends ICaseObjCommon {
  children: Array<IProcessedCaseObj>
}

interface ICollectionClass {
  collectionName: string;
  className: string;
}