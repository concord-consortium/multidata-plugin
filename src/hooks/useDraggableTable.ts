import { DragEndEvent, Over } from "@dnd-kit/core";
import { useContext, useState, createContext, useCallback } from "react";
import { ICollection, IDndData, isCollectionData } from "../types";
import { useCodapState } from "./useCodapState";

export type Side = "left"|"right";

const topDiff = 120;
const heightDiff = 25;

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
  const { getPluginFrameRect } = useCodapState();

  const getCollectionAndAttribute = useCallback((data?: IDndData) => {
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

  const handleDrop = useCallback(async (e: DragEndEvent) => {
    const { active, over } = e;
// FIXME: using the pluginframeRect from the plugin API doesn't return a consistent
// top and height value. It differes from actual CODAP webview top and height values.
    const pluginFrameRect = await getPluginFrameRect();
    const pointerX = (e.activatorEvent as MouseEvent)?.clientX;
    const pointerY = (e.activatorEvent  as MouseEvent)?.clientY;

    console.log("e.activatorEvent:", {
      x: pointerX,
      y: pointerY,
    });
    const pluginFrameBottom = pluginFrameRect ? pluginFrameRect.top + pluginFrameRect.height - heightDiff  : 0;

    const outsidePlugin = pluginFrameRect !== null && typeof pluginFrameRect === "object" &&
                            (pointerX < pluginFrameRect.left || pointerX > pluginFrameRect.right ||
                              pointerY < pluginFrameRect.top || pointerY > pluginFrameBottom);
    console.log("outsidePlugin", outsidePlugin);
    // Plugin should ignore drops if it is outside the CODAP webview
    if (outsidePlugin) {
      return;
    }
    
    if (over) {
      const source = getCollectionAndAttribute(active.data.current as IDndData);
      const overData = over.data.current;
      const target = getCollectionAndAttribute(overData as IDndData);

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
  }, [getPluginFrameRect, dragSide, getCollectionAndAttribute, handleCreateCollectionFromAttribute,
      handleUpdateAttributePosition]);

  return {
    handleDragOver,
    handleDrop,
    dragSide,
  };
};

export const useDraggableTableContext = () => useContext<DraggableTableContextType>(DraggableTableContext);
