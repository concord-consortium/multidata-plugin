import { useState } from "react";
import { ICollection } from "../types";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export const updateCollectionAttributes = (collections: ICollection[], sourceCollection: ICollection,
  targetCollection: ICollection, activeIdx: number, newIdx: number, attr: any) => {
  const getIndex = (coll: ICollection) => collections.findIndex(c => c.id === coll.id);

  const collectionIndex = getIndex(targetCollection);
  const newCollection = {...targetCollection};
  const newCollections = [...collections];

  if (sourceCollection?.id === targetCollection.id) {
    newCollection.attrs = arrayMove(newCollection.attrs, activeIdx, newIdx);
  } else {
    if (sourceCollection) {
      // Remove attribute from parent collection.
      const indexOfParentCollection = getIndex(sourceCollection);
      const newParentCollection = {...sourceCollection};
      newParentCollection.attrs.splice(activeIdx, 1);
      newCollections[indexOfParentCollection] = newParentCollection;
      // And add to target collection.
      newCollection.attrs.splice(newIdx, 0, attr);
    }
  }

  newCollections[collectionIndex] = newCollection;
  return newCollections;
};
interface IUseDragging {
  collections: Array<ICollection>,
  handleSetCollections: (collections: Array<ICollection>) => void,
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void,
}

export const useDragging = (props: IUseDragging) => {
  const {collections, handleSetCollections, handleUpdateAttributePosition} = props;
  const [activeAttr, setActiveAttr] = useState<any>();
  const [parentCollection, setParentCollection] = useState<ICollection>();
  const [targetCollection, setTargetCollection] = useState<ICollection>();

  const handleDragStart = (e: DragStartEvent) => {
    const {active} = e;
    const collection = collections.find((coll) => coll.attrs.find(attr => attr.cid === active.id));
    if (collection) {
      setParentCollection(collection);
      const attribute = collection.attrs.find((attr) => attr.cid === active.id);
      setActiveAttr(attribute);
    }
  };

  const handleDragOver = (e: DragOverEvent) => {
    const {over} = e;
    const target = collections.find((coll) => coll.attrs.find(attr => attr.cid === over?.id));
    setTargetCollection(target);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    const eventObjsDefined = active && over;
    const collectionsDefined = parentCollection && targetCollection;

    if (active.id !== over?.id && eventObjsDefined && collectionsDefined) {
      const activeIndex = parentCollection.attrs.indexOf(activeAttr);
      const overIndex = targetCollection.attrs.findIndex((attr) => attr.cid === over?.id);
      // Check if we are just moving attribute within same collection.
      if (targetCollection.id === parentCollection.id) {
        // If the new index is greater than the active index, CODAP will place behind one.
        // Set to +1 to fix this.
        const newIndex = overIndex > activeIndex ? overIndex + 1 : overIndex;
        const newCollections = updateCollectionAttributes(collections, parentCollection,
          parentCollection, activeIndex, overIndex, null);
        handleSetCollections(newCollections);
        handleUpdateAttributePosition(parentCollection, activeAttr.name, newIndex);
      } else {
        // If we try to move an attr from one column to the end of another, the attr will automatically be
        // placed before the last item. to avoid this, calculate newIndex based on placement of attr and if
        // attr is below target, place below.
        const { translated } = active.rect.current;
        const overRect = over.rect;
        const distanceFromTarget = translated ? overRect.top - translated.top : null;
        const isBelowTarget = distanceFromTarget && distanceFromTarget <= .5 * overRect.height;
        const newIndex = isBelowTarget ? overIndex + 1 : overIndex;
        handleSetCollections(updateCollectionAttributes(collections, parentCollection,
          targetCollection, activeIndex, newIndex, activeAttr));
        handleUpdateAttributePosition(targetCollection, activeAttr.name, newIndex);
      }
    }
    setActiveAttr(null);
    setParentCollection(undefined);
    setTargetCollection(undefined);
  };

  return {
    activeAttr,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
