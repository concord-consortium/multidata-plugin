import { Instance, SnapshotIn, types } from "mobx-state-tree";
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
  },
  get attrPrecisions() {
    const precisions: Record<string, number> = {};
    self.collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        precisions[attr.name] = attr.precision;
      });
    });
    return precisions;
  },
  get attrTypes() {
    const attrTypes: Record<string, string> = {};
    self.collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        attrTypes[attr.name] = attr.type;
      });
    });
    return attrTypes;
  },
  get attrVisibilities() {
    const visibilities: Record<string, boolean> = {};
    self.collections.forEach(collection => {
      collection.attrs.forEach(attr => {
        visibilities[attr.name] = attr.hidden;
      });
    });
    return visibilities;
  },
  get visibleCollections() {
    return self.collections.filter(collection => collection.attrs.some(attr => !attr.hidden));
   }
}));

export type CollectionsModelType = Instance<typeof CollectionsModel>;
export type CollectionsModelSnapshot = SnapshotIn<typeof CollectionsModel>;
