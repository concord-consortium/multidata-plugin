import { DragEndEvent, Over } from "@dnd-kit/core";
import React, { useContext, useState, createContext, useCallback, useRef } from "react";
import { ICollection } from "../types";

export type Side = "left"|"right";

type DraggableTableContextType = {
  handleDragOver: (clientX: number, over?: Over) => void
  dragSide: Side | undefined
};

export const DraggableTableContext = createContext<DraggableTableContextType>({
    handleDragOver: () => undefined,
    dragSide: undefined,
  }
);

interface IUseDraggableTableOptions {
  collections: Array<ICollection>,
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void,
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>
}

export const useDraggableTable = (options: IUseDraggableTableOptions) => {
  const {collections, handleUpdateAttributePosition, handleCreateCollectionFromAttribute} = options;
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

  const handleDragOver = (clientX: number, _over?: Over) => {
    if (_over?.rect) {
      setDragSide(clientX < _over.rect.left + _over.rect.width / 2 ? "left" : "right");
    }
  };

  const handleOnDrop = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (over) {
      const targetId = `${over.id}`;
      const source = getCollectionAndAttribute(`${active.id}`);
      const target = getCollectionAndAttribute(targetId);

      if (targetId.startsWith("parent:")) {
        // handle drag to create parent
        const parts = targetId.split(":");
        const collectionId = parts[1] === "root" ? "root" : parseInt(parts[1], 10);
        if ((collectionId === "root" || !isNaN(collectionId)) && source) {
          handleCreateCollectionFromAttribute(source.collection, source.attr, collectionId);
        }
      } else if (source && target && (source.collection !== target.collection || source.attr !== target.attr)) {
        const sourceIndex = source.attr && source.collection.attrs.indexOf(source.attr);
        const targetIndex = target.attr ? target.collection.attrs.indexOf(target.attr) : target.collection.attrs.length;
        const newIndex = dragSide === "left" ? targetIndex : targetIndex + 1;

        if (target.collection.id === source.collection.id) {
          if (source.attr && sourceIndex !== newIndex) {
            handleUpdateAttributePosition(source.collection, source.attr.name, newIndex);
          }
        } else if (source.attr) {
          handleUpdateAttributePosition(target.collection, source.attr.name, newIndex);
        }
      }
    }
  }, [dragSide, getCollectionAndAttribute, handleUpdateAttributePosition, handleCreateCollectionFromAttribute]);

  return {
    handleDragOver,
    handleOnDrop,
    dragSide,
  };
};

export const useDraggableTableContext = () => useContext<DraggableTableContextType>(DraggableTableContext);
