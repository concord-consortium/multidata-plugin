import React from "react";
import { useCodapState } from "../../hooks/useCodapState";
import { useWindowResized } from "../../hooks/useWindowResized";
import { useDragging } from "../../hooks/useDragging";
import { DndContext, DragOverlay, DropAnimation, closestCorners,
  defaultDropAnimation } from "@dnd-kit/core";
import { Collection } from "./collection";
import { Menu } from "../menu";

import css from "./hierarchy.scss";

const CollectionGap = 23;

interface IProps {
  onSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const Hierarchy = (props: IProps) => {
  const { onSelectDataSet } = props;
  const { selectedDataSet, collections, handleSetCollections, handleAddCollection,
    handleAddAttribute, handleUpdateAttributePosition, handleSelectSelf } = useCodapState();

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
      <div className={css.hierarchyWrapper} onClick={handleSelectSelf}>
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
      </div>
    );
  };

  return (
    <div>
      <Menu
        onSelectDataSet={onSelectDataSet}
      />
      {selectedDataSet && renderHeirarchy()}
    </div>
  );
};

export default Hierarchy;
