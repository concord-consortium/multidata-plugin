import React, { useState } from "react";
import { InteractiveState } from "../../hooks/useCodapState";
import { useWindowResized } from "../../hooks/useWindowResized";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  DropAnimation, closestCorners, defaultDropAnimation } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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

  const [activeAttr, setActiveAttr] = useState<any>();
  const [parentCollection, setParentCollection] = useState<ICollection>();
  const [targetCollection, setTargetCollection] = useState<ICollection>();

  // this will ensure that the component re-renders if the plugin window resizes - it keeps a local state variable
  // of the last resize time
  useWindowResized();
  const renderHeirarchy = () => {
    const numCollections = collections.length;

    const dropAnimation: DropAnimation = {
      ...defaultDropAnimation,
    };

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
      const newCollections = [...collections.map((c) => {
        return {...c, attrs: [...c.attrs.map(a => {return {...a};})]};
      })];
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
      if (active && over && active.id !== over?.id && parentCollection && targetCollection) {
        const activeIndex = parentCollection.attrs.indexOf(activeAttr);
        const overIndex = targetCollection.attrs.findIndex((attr) => attr.cid === over?.id);
        if (targetCollection.id === parentCollection.id) {
          // If the new index is greater than the active index, CODAP will place behind one.
          const newIndex = overIndex > activeIndex ? overIndex + 1 : overIndex;
          setCollectionAttributes(parentCollection, activeIndex, overIndex, null);
          handleUpdateAttributePosition(parentCollection, activeAttr.name, newIndex);
        } else {
          // if we try to move an attr from one column to the end of another, the attr will automatically be
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
