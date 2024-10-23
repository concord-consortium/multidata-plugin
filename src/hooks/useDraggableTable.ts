import { DragEndEvent, Over } from "@dnd-kit/core";
import { useContext, useState, createContext, useCallback } from "react";
import { ICollection, IData, isCollectionData } from "../types";

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

  const getCollectionAndAttribute = useCallback((data?: IData) => {
    if (!data) return;

    const { collectionId, attrTitle } = data;
    const collection = collections.find(c => collectionId != null && `${collectionId}` === `${c.id}`);
    if (!collection) return;

    return { collection, attr: collection.attrs.find(a => a.title === attrTitle)};
  }, [collections]);

  const handleDragOver = (clientX: number, _over?: Over) => {
    if (_over?.rect) {
      setDragSide(clientX < _over.rect.left + _over.rect.width / 2 ? "left" : "right");
    }
  };

  const handleDrop = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (over) {
      const source = getCollectionAndAttribute(active.data.current as IData);
      const overData = over.data.current;
      const target = getCollectionAndAttribute(overData as IData);

      if (isCollectionData(overData)) {
        // handle drag to create parent
        const { collectionId } = overData;
        if ((collectionId === "root" || (typeof collectionId === "number" && !isNaN(collectionId))) && source) {
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
    setDragSide(undefined);
  }, [dragSide, getCollectionAndAttribute, handleUpdateAttributePosition, handleCreateCollectionFromAttribute]);

  return {
    handleDragOver,
    handleDrop,
    dragSide,
  };
};

export const useDraggableTableContext = () => useContext<DraggableTableContextType>(DraggableTableContext);
