import { Instance, types } from "mobx-state-tree";

const CaseCollectionModel = types.model("CaseCollectionModel", {
  id: types.identifierNumber,
  name: types.string
});

export const CaseModel = types.model("CaseModel", {
  children: types.array(types.late((): any => CaseModel)),
  collection: CaseCollectionModel,
  id: types.identifierNumber,
  parent: types.maybe(types.number),
  values: types.map(types.frozen())
});

export type CaseModelType = Instance<typeof CaseModel>;
