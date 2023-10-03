import React, { useContext, useState, createContext, useCallback, useRef } from "react";
import { ICollection } from "../types";
import { updateCollectionAttributes } from "./useDragging";

export type Side = "left"|"right";

type DraggableTableContextType = {
  handleDragStart: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragEnter: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleOnDrop: (e: React.DragEvent<HTMLTableCellElement>) => void
  dragOverId: string | undefined
  dragSide: Side | undefined
};

export const DraggableTableContext = createContext<DraggableTableContextType>({
    handleDragStart: () => undefined,
    handleDragOver: () => undefined,
    handleDragEnter: () => undefined,
    handleDragLeave: () => undefined,
    handleOnDrop: () => undefined,
    dragOverId: undefined,
    dragSide: undefined,
  }
);

interface IUseDraggableTableOptions {
  collections: Array<ICollection>,
  handleSetCollections: (collections: Array<ICollection>) => void,
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void,
}

export const useDraggableTable = (options: IUseDraggableTableOptions) => {
  const {collections, handleSetCollections, handleUpdateAttributePosition} = options;
  const [dragId, setDragId] = useState<string|undefined>(undefined);
  const [dragOverId, setDragOverId] = useState<string|undefined>(undefined);
  const [dragSide, setDragSide] = useState<Side|undefined>("left");
  const dragOverRectRef = useRef<DOMRect|undefined>(undefined);

  const getItemId = (e: React.DragEvent<HTMLTableCellElement>) => (e.target as HTMLElement)?.dataset?.id;

  const getCollectionAndAttribute = useCallback((id?: string) => {
    let collection: ICollection|undefined = undefined;

    if (!id) {
      return undefined;
    }

    const [collectionId, attrTitle] = id.split("-");
    collection = collections.find(c => collectionId === `${c.id}`);
    if (!collection) {
      return undefined;
    }

    return {collection, attr: collection.attrs.find(a => a.title === attrTitle)};
  }, [collections]);

  const updateDragSide = (e: React.DragEvent<HTMLTableCellElement>) => {
    let side: Side|undefined = undefined;
    if (dragOverRectRef.current) {
      side = e.clientX < dragOverRectRef.current.left + dragOverRectRef.current.width/2 ? "left" : "right";
    }
    setDragSide(side);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>) => {
    setDragId(getItemId(e));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableCellElement>) => {
    dragOverRectRef.current = (e.target as HTMLElement).getBoundingClientRect?.();
    updateDragSide(e);
    setDragOverId(getItemId(e));
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    // allow drag overs on other headers if it has an item id set
    if (getItemId(e) === dragOverId) {
      updateDragSide(e);
      e.preventDefault();
    } else {
      dragOverRectRef.current = undefined;
    }
  };

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLTableCellElement>) => {
    // if moving out of a drag zone into a non-drag zone clear the drag over id
    if (getItemId(e) === dragOverId) {
      setDragOverId(undefined);
    }
  }, [dragOverId]);

  const handleOnDrop = useCallback((e: React.DragEvent<HTMLTableCellElement>) => {
    const targetId = getItemId(e);
    if (dragId && targetId) {
      const source = getCollectionAndAttribute(dragId);
      const target = getCollectionAndAttribute(targetId);

      if (source && target && (source.collection !== target.collection || source.attr !== target.attr)) {
        const sourceIndex = source.collection.attrs.indexOf(source.attr);
        const targetIndex = target.attr ? target.collection.attrs.indexOf(target.attr) : target.collection.attrs.length;
        const newIndex = dragSide === "left" ? targetIndex : targetIndex + 1;

        if (target.collection.id === source.collection.id) {
          if (sourceIndex !== newIndex) {
            const newCollections = updateCollectionAttributes(collections, source.collection, target.collection,
              sourceIndex, newIndex, null);
            handleSetCollections(newCollections);
            handleUpdateAttributePosition(source.collection, source.attr.name, newIndex);
          }
        } else {
          const newCollections = updateCollectionAttributes(collections, source.collection, target.collection,
            sourceIndex, newIndex, source.attr);
          handleSetCollections(newCollections);
          handleUpdateAttributePosition(target.collection, source.attr.name, newIndex);
        }
      }
    }

    setDragOverId(undefined);
  }, [dragSide, collections, dragId, getCollectionAndAttribute, handleSetCollections, handleUpdateAttributePosition]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleOnDrop,
    dragOverId,
    dragSide
  };
};

export const useDraggableTableContext = () => useContext<DraggableTableContextType>(DraggableTableContext);

