import React, { useEffect, useRef, useState } from "react";
import { InteractiveState } from "../hooks/useCodapState";
import { IDataSet, ICollections, ICollection } from "../types";
import { Menu } from "./menu";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove} from "@dnd-kit/sortable";
import AddIcon from "../assets/add-icon.svg";
import { CSS } from "@dnd-kit/utilities";
import { useWindowResized } from "../hooks/useWindowResized";

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
  handleUpdateAttributePosition: (collection: ICollection, attrName: string,
  newPosition: number, newAttrsOrder: Array<any>) => void,
  handleAddCollection: (newCollectionName: string) => void
  handleAddAttribute: (collection: ICollection, newAttrName: string) => void,
  handleRemoveAttribute: (collection: ICollection, attrName: string) => void,
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

const AddAttribute = ({collection, handleAddAttribute}: {collection: ICollection,
  handleAddAttribute: (coll: ICollection, newAttrName: string) => void}) => {
  const [showInput, setShowInput] = useState<boolean>(false);
  const [newAttrName, setNewAttrName] = useState<string>("newAttr");

  const handleAddButtonClick = () => {
    setShowInput(true);
  };

  const renderInput = () => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAttrName(e.target.value);
    };

    const handleNewAttrNameClick = () => {
      handleAddAttribute(collection, newAttrName);
      setShowInput(false);
    };

    return (
      <div className={css.createNewAttr}>
        <input type="textbox" defaultValue={"newAttr"} onChange={handleChange}></input>
        <button onClick={handleNewAttrNameClick}>+</button>
      </div>
    );
  };

  return showInput ? renderInput() : (
    <div onClick={handleAddButtonClick} className={`${css.addButton} ${css.attribute}`}>
      <AddIcon />
    </div>
  );
};

interface IAddCollectionProps {
  levelBBox: IBoundingBox,
  handleAddCollection: (newCollectionName: string) => void,
  collections: Array<ICollection>
}

const AddCollection = ({levelBBox, handleAddCollection, collections}: IAddCollectionProps) => {
  const {top, left, width} = levelBBox;
  const style: React.CSSProperties = {left: left + width, top, position: "absolute"};

  const [showTitleBox, setShowTitleBox] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClick = () => {
    setShowTitleBox(true);
  };

  const renderTitleBox = () => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewCollectionName(e.target.value);
    };

    const handleNewNameClick = () => {
      const isNameDuplicate = collections.find(coll => coll.name === newCollectionName);
      if (!newCollectionName.length) {
        setErrorMessage("Error: Collection name must be at least one character long.");
        setShowError(true);
      } else if (isNameDuplicate) {
        setErrorMessage("Error: A collection with that name already exists.");
        setShowError(true);
      } else {
        handleAddCollection(newCollectionName);
      }
    };

    return (
      <div className={css.createNewCollection} style={style}>
        <input type="textbox" defaultValue={``} onChange={handleChange}></input>
        <button className={css.submitButton} onClick={handleNewNameClick}>Create</button>
        {showError && <div className={css.error}>{errorMessage}</div>}
      </div>
    );
  };

  const renderAddButon = () => {
    return (
      <div onClick={handleClick} style={style} className={`${css.addButton} ${css.collection}`}><AddIcon /></div>
    );
  };

  return (
    <div>
      {showTitleBox ? renderTitleBox() : renderAddButon()}
    </div>
  );
};

const Attr = ({attr}: {attr: any}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: attr.cid});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div className={css.attrContainer} ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
  handleAddCollection: (newCollectionName: string) => void;
  handleAddAttribute: (collection: ICollection, newAttrName: string) => void;
  collections: Array<ICollection>;
}

const Collection = (props: CollectionProps) => {
  const {collection, index, isLast, handleAddAttribute, handleAddCollection, collections} = props;
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
      <div className={css.attrs}>
        <SortableContext items={collection.attrs.map((attr) => attr.cid)} strategy={verticalListSortingStrategy}>
          {collection.attrs.map(attr => <Attr attr={attr} key={`attr-${index}-${attr.cid}`} />)}
        </SortableContext>
      </div>}
      {<AddAttribute collection={collection} handleAddAttribute={handleAddAttribute}/>}
      <AttrsArrow levelBBox={levelBBox} key={`attrs-arrow-${index}-${collection.cid}`} />
      {!isLast && <LevelArrow levelBBox={levelBBox} key={`level-arrow-${index}-${collection.cid}`}/>}
      {
        isLast &&
          <AddCollection
            levelBBox={levelBBox}
            handleAddCollection={handleAddCollection}
            collections={collections}
          />
      }
    </div>
  );
};

export const Hierarchy = (props: IProps) => {
  const {selectedDataSet, dataSets, collections, handleSelectDataSet,
    handleUpdateAttributePosition, handleAddCollection, handleAddAttribute, handleRemoveAttribute} = props;

  // this will ensure that the component re-renders if the plugin window resizes - it keeps a local state variable
  // of the last resize time
  useWindowResized();

  const renderHeirarchy = () => {
    const numCollections = collections.length;

    const handleDragEnd = (e: DragEndEvent) => {
      const {active, over} = e;
      if (active.id !== over?.id) {
        const collectionWithAttribute = collections.find((coll) => coll.attrs.find(attr => attr.cid === active.id));
        const collectionDraggedTo = collections.find((coll) => coll.attrs.find(attr => attr.cid === over?.id));
        const collectionsAreSame = collectionWithAttribute === collectionDraggedTo;
        const activeAttr = collectionWithAttribute!.attrs.find((attr) => attr.cid === active.id);
        const activeAttrIndex = collectionWithAttribute!.attrs.indexOf(activeAttr);
        if (collectionsAreSame) {
          const overIndex = collectionWithAttribute!.attrs.findIndex((attr) => attr.cid === over?.id);
          const newAttrsOrder = arrayMove(collectionWithAttribute!.attrs, activeAttrIndex, overIndex);
          // If the new index is greater than the active index, CODAP will for some reason place behind one.
          const newIndex = overIndex > activeAttrIndex ? overIndex + 1 : overIndex;
          handleUpdateAttributePosition(collectionWithAttribute!, activeAttr.name, newIndex, newAttrsOrder);
        } else if (!collectionsAreSame) {
          const overIndex = collectionDraggedTo!.attrs.findIndex((attr) => attr.cid === over?.id);
          const copyOfCollectionDraggedTo = {...collectionDraggedTo};
          const {attrs} = copyOfCollectionDraggedTo;
          attrs!.splice(overIndex, 0, activeAttr);
          handleUpdateAttributePosition(collectionDraggedTo!, activeAttr.name, overIndex, attrs!);
          handleRemoveAttribute(collectionWithAttribute!, activeAttr.name);
        }
      }
    };

    return (
      <>
        <div className={css.hierarchy} style={{gap: CollectionGap}}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {collections.map((collection, index) => {
            return (
              <Collection
                collection={collection}
                key={`${index}-${collection.cid}`}
                index={index}
                isLast={index >= numCollections - 1}
                handleAddCollection={handleAddCollection}
                handleAddAttribute={handleAddAttribute}
                collections={collections}
              />
            );
          })}
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
