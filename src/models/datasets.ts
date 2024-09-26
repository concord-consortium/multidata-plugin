import { Instance, types } from "mobx-state-tree";

export const DataSetModel = types.model("DataSetModel", {
  guid: types.number,
  id: types.identifierNumber,
  name: types.string,
  title: types.optional(types.string, "")
});

export type DataSetModelType = Instance<typeof DataSetModel>;

export const DataSetsModel = types.array(DataSetModel);
export type DataSetsModelType = Instance<typeof DataSetsModel>;
