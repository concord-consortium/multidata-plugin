import { Instance, types } from "mobx-state-tree";

export const DataSetModel = types.model("DataSetModel", {
  guid: types.number,
  id: types.number,
  name: types.string,
  title: types.optional(types.string, "")
});

export type DataSetModelType = Instance<typeof DataSetModel>;

export const DataSetsModel = types.model("DataSetsModel", {
  dataSets: types.array(DataSetModel),
  selectedDataSet: types.maybe(types.number)
});

export type DataSetsModelType = Instance<typeof DataSetsModel>;
