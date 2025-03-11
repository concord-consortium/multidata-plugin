import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { IResult } from "@concord-consortium/codap-plugin-api";
import { InteractiveState } from "../../hooks/useCodapState";
import { DraggableTableContext, useDraggableTable } from "../../hooks/useDraggableTable";
import { CollectionsModelType } from "../../models/collections";
import { ICollection, IProcessedCaseObj, Values, ICollectionClass, IDataSet, ISelectedCase } from "../../types";
import { nestedTableCollisionDetection } from "../../utils/table-collision-detection";
import { Menu } from "../menu";
import { FlatTable } from "./flat/flat-table";
import { LandscapeTable } from "./landscape/landscape-table";
import { PortraitTable } from "./portrait/portrait-table";

import css from "./nested-table.scss";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

interface IProps {
  selectedDataSet: IDataSet | null;
  dataSets: IDataSet[];
  collectionsModel: CollectionsModelType;
  cases: IProcessedCaseObj[];
  interactiveState: InteractiveState;
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>, defaultDisplayMode?: string) => void;
  updateInteractiveState: (update: Partial<InteractiveState>) => void;
  handleShowComponent: () => void;
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>
  editCaseValue: (newValue: string, caseObj: IProcessedCaseObj, attrTitle: string) => Promise<IResult | undefined>;
  handleAddAttribute: (collection: ICollection, attrName: string, tableIndex: number) => Promise<void>;
  renameAttribute: (collectionName: string, attrId: number, oldName: string, newName: string) => Promise<void>;
  selectCases?: (caseIds: number[]) => Promise<void>;
  selectionList?: ISelectedCase[];
}

export const NestedTable = observer(function NestedTable(props: IProps) {
  const {selectedDataSet, dataSets, collectionsModel, cases, interactiveState,
         handleSelectDataSet, updateInteractiveState, handleShowComponent,
         handleUpdateAttributePosition, handleCreateCollectionFromAttribute,
         editCaseValue, renameAttribute, handleAddAttribute, selectCases,
         selectionList} = props;
  const [collectionClasses, setCollectionClasses] = useState<ICollectionClass[]>([]);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});
  const collections = collectionsModel.collections;

  const draggableTable = useDraggableTable({
    collections,
    handleUpdateAttributePosition,
    handleCreateCollectionFromAttribute
  });

  useEffect(() => {
    if (collections.length) {
      const classes = collections.map((coll: ICollection, idx: number) => {
        return {
          collectionName: coll.name,
          className: `collection${idx}`
        };
      });
      setCollectionClasses(classes);
    } else {
      setCollectionClasses([]);
    }
  }, [collections, collections.length]);

  useEffect(() => {
    if (!interactiveState.dataSetName) {
      updateInteractiveState({displayMode: none});
    }
  }, [interactiveState.dataSetName, updateInteractiveState]);

  useEffect(() => {
    const style =  interactiveState.padding ? {padding: "3px"} : {padding: "0px"};
    setPaddingStyle(style);
  }, [interactiveState.padding]);

  const getClassName = (caseObj: IProcessedCaseObj) => {
    const {collection} = caseObj;
    const filteredClassNames = collectionClasses.filter((classObj) => {
      return classObj.collectionName === collection.name;
    });
    const className = filteredClassNames.length ? filteredClassNames[0].className : "";
    return className;
  };

  const togglePadding = useCallback(() => {
    updateInteractiveState({padding: !interactiveState.padding});
  }, [interactiveState, updateInteractiveState]);

  const toggleShowHeaders = useCallback(() => {
    updateInteractiveState({showHeaders: !interactiveState.showHeaders});
  }, [interactiveState, updateInteractiveState]);

  const handleSelectDisplayMode = useCallback((mode: string) => {
    updateInteractiveState({displayMode: mode});
  }, [updateInteractiveState]);

  const getValueLength = (firstRow: Array<Values>) => {
    let valueCount = 0;
    firstRow.forEach((values: Values) => {
      const valuesLength = Object.entries(values).length;
      valueCount += valuesLength;
    });
    return valueCount;
  };

  const renderTable = () => {
    if (!selectedDataSet) return null;

    const isNoHierarchy = collections.length === 1;
    const classesExist = collectionClasses.length > 0;
    const tableProps = {showHeaders: interactiveState.showHeaders, collectionClasses, collectionsModel,
      selectedDataSet, getClassName, getValueLength, paddingStyle, editCaseValue,
      dataSetName: selectedDataSet.name, renameAttribute, handleAddAttribute,
      activeTableIndex: interactiveState.activeTableIndex, selectCases, selectionList
    };
    const flatProps = {...tableProps, cases};
    if (isNoHierarchy && classesExist) {
      return <FlatTable {...flatProps}/>;
    } else {
      return (
        interactiveState.displayMode === portrait ?
          <PortraitTable {...tableProps} /> :
          interactiveState.displayMode === landscape ?
          <LandscapeTable {...tableProps} /> :
          <div/>
      );
    }
  };

  const showDisplayMode = collections.length > 1 && !!selectedDataSet;

  const sensors = useSensors(
    useSensor(KeyboardSensor),
    // Require a small movement before actually starting a drag
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  return (
    <div className={css.nestedTableWrapper} onClick={handleShowComponent}>
      <Menu
        dataSets={dataSets}
        selectedDataSet={selectedDataSet}
        handleSelectDataSet={handleSelectDataSet}
        handleSelectDisplayMode={handleSelectDisplayMode}
        togglePadding={togglePadding}
        toggleShowHeaders={toggleShowHeaders}
        showHeaders={interactiveState.showHeaders}
        padding={interactiveState.padding}
        displayMode={interactiveState.displayMode}
        showDisplayMode={showDisplayMode}
        defaultDisplayMode="Portrait"
      />
      <DraggableTableContext.Provider value={draggableTable}>
        <DndContext collisionDetection={nestedTableCollisionDetection} sensors={sensors}
          onDragEnd={draggableTable.handleDrop}>
          {selectedDataSet && renderTable()}
        </DndContext>
      </DraggableTableContext.Provider>
    </div>
  );
});

export default NestedTable;
