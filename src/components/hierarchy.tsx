import React, { useEffect, useRef, useState } from "react";
import { InteractiveState } from "../hooks/useCodapState";
import { IDataSet, ICollections, ICollection } from "../types";
import { Menu } from "./menu";
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import css from "./hierarchy.scss";

const CollectionGap = 23;
const AttrsGap = 10;
const CollectionOffset = 15;
const StrokeWidth = 2;
const StrokeColor = "#979797";

const HalfStrokeWidth = StrokeWidth / 2;
const HalfCollectionGap = CollectionGap / 2;

interface IProps {
  selectedDataSet: any;
  dataSets: IDataSet[];
  collections: ICollections;
  items: any[];
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateInteractiveState: (update: Partial<InteractiveState>) => void
}

interface IBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const AttrsArrow = ({levelBBox}: {levelBBox: IBoundingBox}) => {
  const {top, left, width, height} = levelBBox;
  const style: React.CSSProperties = {left: left + (width / 2), top: top + height};
  const path = `M ${HalfStrokeWidth} 0 L ${HalfStrokeWidth} ${AttrsGap}`;

  return (
    <svg className={css.attrsArrow} style={style} xmlns="http://www.w3.org/2000/svg" width={StrokeWidth} height={AttrsGap} viewBox={`0 0 ${StrokeWidth} ${AttrsGap}`}>
      <path d={path} stroke={StrokeColor} strokeWidth={StrokeWidth} />
    </svg>
  );
};

const LevelArrow = ({levelBBox}: {levelBBox: IBoundingBox}) => {
  const {top, left, width, height} = levelBBox;
  const style: React.CSSProperties = {left: left + width, top: top + height / 2};
  const path = [
    `M 0 ${HalfStrokeWidth}`,
    `L ${HalfCollectionGap} ${HalfStrokeWidth}`,
    `L ${HalfCollectionGap} ${CollectionOffset - HalfStrokeWidth}`,
    `L ${CollectionGap} ${CollectionOffset - HalfStrokeWidth}`
  ].join(" ");

  return (
    <svg className={css.levelArrow} style={style} xmlns="http://www.w3.org/2000/svg" width={CollectionGap} height={CollectionOffset} viewBox={`0 0 ${CollectionGap} ${CollectionOffset}`}>
      <path d={path} stroke={StrokeColor} strokeWidth={StrokeWidth} fill="transparent" />
    </svg>
  );
};

const Attr = ({attr}: {attr: any}) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: attr.cid});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // LUCY: the transform value is always undefined right now which is probably why the items don't visually re-order (maybe?)

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={css.attr}>
        {attr.name}
      </div>
    </div>
  );
};

interface CollectionProps {
  collection: ICollection
  index: number
  isLast: boolean;
}
const Collection = (props: CollectionProps) => {
  const {collection, index, isLast} = props;
  const style: React.CSSProperties = {marginTop: index * CollectionOffset, gap: AttrsGap};
  const levelRef = useRef<HTMLDivElement>(null);
  const [levelBBox, setLevelBBox] = useState<IBoundingBox>({top: 0, left: 0, width: 0, height: 0});

  // recalculate the bounding box on each render as it depends on the dom ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (levelRef.current) {
      const {top, left, width, height} = levelRef.current.getBoundingClientRect();
      const newLevelBBox: IBoundingBox = {top, left, width, height};
      if (JSON.stringify(levelBBox) !== JSON.stringify(newLevelBBox)) {
        setLevelBBox(newLevelBBox);
      }
    }
  });

  return (
    <div className={css.collection} style={style}>
      <div className={css.level} ref={levelRef}>Level {index + 1}</div>
      <div className={css.attrs}>
        <SortableContext items={collection.attrs} strategy={verticalListSortingStrategy}>
          {collection.attrs.map(attr => <Attr attr={attr} key={`attr-${index}-${attr.cid}`} />)}
        </SortableContext>
      </div>
      <AttrsArrow levelBBox={levelBBox} key={`attrs-arrow-${index}-${collection.cid}`} />
      {!isLast && <LevelArrow levelBBox={levelBBox} key={`level-arrow-${index}-${collection.cid}`}/>}
    </div>
  );
};

export const Hierarchy = (props: IProps) => {
  const {selectedDataSet, dataSets, collections, handleSelectDataSet} = props;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    console.log("DRAG END", e);

    // LUCY: this is where the logic to reorder items would go...
  };

  const renderHeirarchy = () => {
    const numCollections = collections.length;
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={css.hierarchy} style={{gap: CollectionGap}}>
          {collections.map((collection, index) => {
            return (
              <Collection
                collection={collection}
                key={`${index}-${collection.cid}`}
                index={index}
                isLast={index >= numCollections - 1}
              />
            );
          })}
        </div>
        {false &&
          <div className={css.debug}>
            {JSON.stringify(selectedDataSet, null, 2)}
          </div>
        }
      </DndContext>
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
