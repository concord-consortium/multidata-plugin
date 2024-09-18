import { Instance, types } from "mobx-state-tree";

export const InteractiveStateModel = types.model("InteractiveStateModel", {
  dataSetName: types.maybe(types.string),
  displayMode: types.optional(types.string, ""),
  padding: types.optional(types.boolean, false),
  showHeaders: types.optional(types.boolean, false),
  view: types.maybe(types.string)
});

export type InteractiveStateModelType = Instance<typeof InteractiveStateModel>;
