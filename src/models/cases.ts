import { Instance, types } from "mobx-state-tree";

const CaseCollectionModel = types.model("CaseCollectionModel", {
  id: types.number,
  name: types.string
});

export const CaseModel = types.model("CaseModel", {
  children: types.array(types.late((): any => CaseModel)),
  collection: CaseCollectionModel,
  id: types.number,
  parent: types.maybe(types.number),
  values: types.map(types.frozen())
});

export type CaseModelType = Instance<typeof CaseModel>;

export const CasesModel = types.model("CasesModel", {
  cases: types.array(CaseModel),
  selectedCase: types.maybe(types.number)
});

export type CasesModelType = Instance<typeof CasesModel>;
