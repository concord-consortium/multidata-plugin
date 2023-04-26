import React, { useEffect, useRef, useState } from "react";
import { IBoundingBox, ICollection } from "../../types";
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable";
import { SortableAttr } from "./sortable-attr";
import { AddAttribute } from "./add-buttons";
import { AttrsArrow, LevelArrow } from "./arrows";

import css from "./collection.scss";

interface ICollectionProps {
  collection: ICollection;
  index: number;
  isLast: boolean;
  handleAddCollection: (newCollectionName: string) => void;
  handleAddAttribute: (collection: ICollection, newAttrName: string) => void;
  collections: Array<ICollection>;
}

const AttrsGap = 10;
const CollectionOffset = 15;

export const Collection = (props: ICollectionProps) => {
  const {collection, index, isLast, handleAddAttribute} = props;
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
      {collection.attrs?.length &&
        <SortableContext items={collection.attrs.map((attr) => attr.cid)} strategy={rectSwappingStrategy}>
          <div className={css.attrs}>
              {collection.attrs.map(attr => <SortableAttr attr={attr} key={`attr-${index}-${attr.cid}`} />)}
          </div>
        </SortableContext>
      }
      {<AddAttribute collection={collection} handleAddAttribute={handleAddAttribute}/>}
      <AttrsArrow levelBBox={levelBBox} key={`attrs-arrow-${index}-${collection.id}`} />
      {!isLast && <LevelArrow levelBBox={levelBBox} key={`level-arrow-${index}-${collection.id}`}/>}
    </div>
  );
};
