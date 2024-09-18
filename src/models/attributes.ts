import { Instance, types } from "mobx-state-tree";

export const AttributeModel = types.model("AttributeModel", {
  cid: types.identifier,
  deletable: types.optional(types.boolean, true),
  editable: types.boolean,
  guid: types.number,
  hidden: types.boolean,
  id: types.number,
  name: types.string,
  renamable: types.optional(types.boolean, true),
  title: types.string,
  type: types.string,
});

export type AttributeModelType = Instance<typeof AttributeModel>;
