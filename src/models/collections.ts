import { Instance, types } from "mobx-state-tree";
import { CaseModel } from "./cases";
import { AttributeModel } from "./attributes";

export const CollectionModel = types.model("CollectionModel", {
  areParentChildLinksConfigured: types.optional(types.boolean, false),
  attrs: types.array(AttributeModel),
  caseName: types.maybe(types.string),
  cases: types.array(CaseModel),
  childAttrName: types.maybe(types.string),
  collapseChildren: types.maybe(types.boolean),
  guid: types.number,
  id: types.identifierNumber,
  name: types.string,
  parent: types.maybe(types.number),
  title: types.string,
  type: types.string
});

export type CollectionModelType = Instance<typeof CollectionModel>;

export const CollectionsModel = types.model("CollectionsModel", {
  collections: types.array(CollectionModel)
})
.views(self => ({
  get rootCollection() {
    return self.collections.find(c => !c.parent);
  },
  get attrs() {
    const result: Record<string, any> = {};
    self.collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        result[attr.name] = attr;
      });
    });
    return result;
  }
}));

export type CollectionsModelType = Instance<typeof CollectionsModel>;
