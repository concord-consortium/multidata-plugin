import { useState } from "react";
import { ICollection } from "../types";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

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

  const setCollectionAttributes = (collection: ICollection, activeIdx: number,
    newIdx: number, attr: any) => {
    const getIndex = (coll: ICollection) => collections.findIndex(c => c.id === coll.id);

    const collectionIndex = getIndex(collection);
    const newCollection = {...collection};
    const newCollections = [...collections];

    if (parentCollection?.id === collection.id) {
      newCollection.attrs = arrayMove(newCollection.attrs, activeIdx, newIdx);
    } else {
      if (parentCollection) {
        // Remove attribute from parent collection.
        const indexOfParentCollection = getIndex(parentCollection);
        const newParentCollection = {...parentCollection};
        newParentCollection.attrs.splice(activeIdx, 1);
        newCollections[indexOfParentCollection] = newParentCollection;
        // And add to target collection.
        newCollection.attrs.splice(newIdx, 0, attr);
      }
    }

    newCollections[collectionIndex] = newCollection;
    handleSetCollections(newCollections);
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
        setCollectionAttributes(parentCollection, activeIndex, overIndex, null);
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
        setCollectionAttributes(targetCollection, activeIndex, newIndex, activeAttr);
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
