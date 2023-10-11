import React, { useContext, useState, createContext, useCallback, useRef } from "react";
import { ICollection } from "../types";
import { updateCollectionAttributes } from "./useDragging";

export type Side = "left"|"right";

type DraggableTableContextType = {
  handleDragStart: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragEnter: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleDragEnd: (e: React.DragEvent<HTMLTableCellElement>) => void
  handleOnDrop: (e: React.DragEvent<HTMLTableCellElement>) => void
  dragOverId: string | undefined
  dragSide: Side | undefined
  dragging: boolean
};

export const DraggableTableContext = createContext<DraggableTableContextType>({
    handleDragStart: () => undefined,
    handleDragOver: () => undefined,
    handleDragEnter: () => undefined,
    handleDragLeave: () => undefined,
    handleDragEnd: () => undefined,
    handleOnDrop: () => undefined,
    dragOverId: undefined,
    dragSide: undefined,
    dragging: false,
  }
);

interface IUseDraggableTableOptions {
  collections: Array<ICollection>,
  handleSetCollections: (collections: Array<ICollection>) => void,
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void,
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>
}

export const useDraggableTable = (options: IUseDraggableTableOptions) => {
  const {collections, handleSetCollections, handleUpdateAttributePosition,
         handleCreateCollectionFromAttribute} = options;
  const [dragId, setDragId] = useState<string|undefined>(undefined);
  const [dragOverId, setDragOverId] = useState<string|undefined>(undefined);
  const [dragSide, setDragSide] = useState<Side|undefined>("left");
  const dragOverRectRef = useRef<DOMRect|undefined>(undefined);
  const [dragging, setDragging] = useState(false);

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
      const target = getCollectionAndAttribute(getItemId(e));
      if (target?.attr) {
        side = e.clientX < dragOverRectRef.current.left + dragOverRectRef.current.width/2 ? "left" : "right";
      } else {
        // no attribute means this is a case header with no attribute so always show insert to the left
        side = "left";
      }
    }
    setDragSide(side);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>) => {
    const itemId = getItemId(e);
    setDragId(itemId);

    // wait until the next render to set the flag so the drag end handler isn't called when the table
    // re-renders and the drop to create parent collection column is displayed
    setTimeout(() => {
      setDragging(true);
    }, 1);

    const drag = getCollectionAndAttribute(itemId);
    if (drag?.attr) {
      const attId = drag.attr.id;

      e.dataTransfer.effectAllowed = "copy";
      // IE only allows text or URL for the argument type and throws an error for other types
      try {
        e.dataTransfer.setData("text", attId);
        e.dataTransfer.setData("text/html", attId);
        e.dataTransfer.setData(`application/x-codap-attr-${attId}`, attId);
      } catch (ex) {
        // to make linter happy with empty block
      }
      // CODAP sometimes seems to expect an SC.Array object with a `contains` method, so this avoids a potential error
      (e.dataTransfer as any).contains = () => false;
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableCellElement>) => {
    dragOverRectRef.current = (e.target as HTMLElement).getBoundingClientRect?.();
    updateDragSide(e);
    setDragOverId(getItemId(e));
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.stopPropagation();
    // allow drag overs on other headers if it has an item id set
    if (getItemId(e) === dragOverId) {
      updateDragSide(e);
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

      if (targetId.startsWith("parent:")) {
        // handle drag to create parent
        const parts = targetId.split(":");
        const collectionId = parts[1] === "root" ? "root" : parseInt(parts[1], 10);
        if ((collectionId === "root" || !isNaN(collectionId)) && source) {
          handleCreateCollectionFromAttribute(source.collection, source.attr, collectionId);
        }
      } else if (source && target && (source.collection !== target.collection || source.attr !== target.attr)) {
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

    setDragging(false);
    setDragOverId(undefined);
  }, [
    dragSide, collections, dragId, getCollectionAndAttribute, handleSetCollections, handleUpdateAttributePosition,
    handleCreateCollectionFromAttribute
  ]);

  const handleDragEnd = (e: React.DragEvent<HTMLTableCellElement>) => setDragging(false);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleOnDrop,
    dragOverId,
    dragSide,
    dragging,
  };
};

export const useDraggableTableContext = () => useContext<DraggableTableContextType>(DraggableTableContext);

