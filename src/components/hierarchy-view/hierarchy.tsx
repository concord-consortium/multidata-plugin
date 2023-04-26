import React from "react";
import { InteractiveState } from "../../hooks/useCodapState";
import { useWindowResized } from "../../hooks/useWindowResized";
import { useDragging } from "../../hooks/useDragging";
import { DndContext, DragOverlay, DropAnimation, closestCorners,
  defaultDropAnimation } from "@dnd-kit/core";
import { IDataSet, ICollections, ICollection } from "../../types";
import { Collection } from "./collection";
import { Menu } from "../menu";

import css from "./hierarchy.scss";

const CollectionGap = 23;

interface IProps {
  selectedDataSet: any;
  dataSets: IDataSet[];
  collections: ICollections;
  items: any[];
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateInteractiveState: (update: Partial<InteractiveState>) => void
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void,
  handleAddCollection: (newCollectionName: string) => void
  handleAddAttribute: (collection: ICollection, newAttrName: string) => void,
  handleSetCollections: (collections: Array<ICollection>) => void
}

export const Hierarchy = (props: IProps) => {
  const {selectedDataSet, dataSets, collections, handleSelectDataSet, handleSetCollections,
    handleUpdateAttributePosition, handleAddCollection, handleAddAttribute} = props;

  const {activeAttr, handleDragStart, handleDragOver, handleDragEnd} = useDragging({collections,
    handleSetCollections, handleUpdateAttributePosition});

  // this will ensure that the component re-renders if the plugin window resizes - it keeps a local state variable
  // of the last resize time
  useWindowResized();
  const renderHeirarchy = () => {
    const numCollections = collections.length;

    const dropAnimation: DropAnimation = {
      ...defaultDropAnimation,
    };

    return (
      <>
        <div className={css.hierarchy} style={{gap: CollectionGap}}>
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {collections.map((collection, index) => {
            return (
              <Collection
                collection={collection}
                key={`${index}-${collection.id}`}
                index={index}
                isLast={index >= numCollections - 1}
                handleAddCollection={handleAddCollection}
                handleAddAttribute={handleAddAttribute}
                collections={collections}
              />
            );
          })}

          <DragOverlay dropAnimation={dropAnimation}>
            {activeAttr && <div className={css.attr}>{activeAttr.name}</div>}
          </DragOverlay>
        </DndContext>
        </div>
        {false &&
          <div className={css.debug}>
            {JSON.stringify(selectedDataSet, null, 2)}
          </div>
        }
      </>
    );
  };

  return (
    <div>
      <Menu
        dataSets={dataSets}
        collections={collections}
        selectedDataSet={selectedDataSet}
        handleSelectDataSet={handleSelectDataSet}
      />
      {selectedDataSet && renderHeirarchy()}
    </div>
  );
};

export default Hierarchy;
