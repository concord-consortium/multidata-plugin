import { IAttribute, ICollections } from "../types";

const getAllAttributesFromCollections = (collections: ICollections[]) => {
  const attrArray: any[] = [];
  collections.forEach((collection: any) => {
    attrArray.push(...collection.attrs);
  });
  return attrArray;
};

export const getAttrPrecisions = (collections: any) => {
  const attrs = getAllAttributesFromCollections(collections);
  const precisions = attrs.reduce((acc: Record<string, number>, attr: any) => {
    const numPrecision = parseInt(attr.precision, 10);
    acc[attr.name] = isNaN(numPrecision) ? 2 : numPrecision;
    return acc;
  }, {});
  return precisions;
};

export const getAttrTypes = (collections: any) => {
  const attrs = getAllAttributesFromCollections(collections);
  const attrTypes = attrs.reduce(
      (acc: Record<string, string | null | undefined>, attr: any) => {
    acc[attr.name] = attr.type || null;
    return acc;
  }, {});
  return attrTypes;
};

export const getAttrVisibility = (collections: any) => {
  const attrs = getAllAttributesFromCollections(collections);
  const attrVisibilities = attrs.reduce(
      (acc: Record<string, boolean>, attr: any) => {
    acc[attr.name] = attr.hidden || false;
    return acc;
  }, {});
  return attrVisibilities;
};

export const newAttributeSlug = "newAttr";

export const isNewAttribute = (name: string|number, index: number, attrs: (string|number|IAttribute)[]) => {
  const newAttrRegex = new RegExp(`^${newAttributeSlug}`);
  return !!(String(name).match(newAttrRegex) && index === attrs.length - 1);
};
