import React, { useCallback, useEffect, useState } from "react";
import { ICollection, ICollectionClass, IProcessedCaseObj, Values } from "../types";
import { Menu } from "./menu";
import { PortraitView } from "./portrait-view";
import { LandscapeView } from "./landscape-view";
import { FlatTable } from "./flat-table";
import { DraggableTableContext, useDraggableTable } from "../hooks/useDraggableTable";
import { useCodapContext } from "../hooks/useCodapContext";

import css from "./nested-table.scss";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

interface IProps {
  selectedDataSet: string;
  onSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const NestedTable = (props: IProps) => {
  const { selectedDataSet, onSelectDataSet} = props;
  const { collections, interactiveState, handleSetCollections, handleUpdateAttributePosition,
    handleCreateCollectionFromAttribute, handleSelectSelf, handleUpdateInteractiveState } = useCodapContext();
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});

  const draggableTable = useDraggableTable({
    collections,
    handleSetCollections,
    handleUpdateAttributePosition,
    handleCreateCollectionFromAttribute
  });

  useEffect(() => {
    if (collections?.length) {
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
  }, [collections]);

  useEffect(() => {
    if (!interactiveState?.dataSetName) {
      handleUpdateInteractiveState({displayMode: none});
    }
  }, [interactiveState?.dataSetName, handleUpdateInteractiveState]);

  useEffect(() => {
    const style =  interactiveState?.padding ? {padding: "3px"} : {padding: "0px"};
    setPaddingStyle(style);
  }, [interactiveState?.padding]);

  const getClassName = (caseObj: IProcessedCaseObj) => {
    const {collection} = caseObj;
    const filteredClassNames = collectionClasses.filter((classObj) => {
      return classObj.collectionName === collection.name;
    });
    const className = filteredClassNames.length ? filteredClassNames[0].className : "";
    return className;
  };

  const togglePadding = useCallback(() => {
    handleUpdateInteractiveState({padding: !interactiveState?.padding});
  }, [interactiveState, handleUpdateInteractiveState]);

  const toggleShowHeaders = useCallback(() => {
    handleUpdateInteractiveState({showHeaders: !interactiveState?.showHeaders});
  }, [interactiveState, handleUpdateInteractiveState]);

  const handleSelectDisplayMode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    handleUpdateInteractiveState({displayMode: e.target.value});
  }, [handleUpdateInteractiveState]);

  const getValueLength = (firstRow: Array<Values>) => {
    let valueCount = 0;
    firstRow.forEach((values: Values) => {
      const valuesLength = Object.entries(values).length;
      valueCount += valuesLength;
    });
    return valueCount;
  };

  const renderTable = () => {
    const isNoHierarchy = collections.length === 1;
    const flatProps = {getValueLength, paddingStyle};
    const nestedTableProps = {...flatProps, collectionClasses, getClassName};
    if (isNoHierarchy) {
      return (
        <FlatTable
          getValueLength={getValueLength}
          paddingStyle={paddingStyle}
        />
      );
    } else {
      return (
        interactiveState.displayMode === portrait ?
          <PortraitView {...nestedTableProps} /> :
          interactiveState.displayMode === landscape ?
          <LandscapeView {...nestedTableProps} /> :
          <div/>
      );
    }
  };

  const showDisplayMode = !!(collections?.length > 1 && selectedDataSet);

  return (
    <div className={css.nestedTableWrapper} onClick={handleSelectSelf}>
      <Menu
        onSelectDataSet={onSelectDataSet}
        onSelectDisplayMode={handleSelectDisplayMode}
        togglePadding={togglePadding}
        toggleShowHeaders={toggleShowHeaders}
        displayMode={interactiveState?.displayMode}
        showDisplayMode={showDisplayMode}
        padding={interactiveState?.padding}
        showHeaders={interactiveState?.showHeaders}
      />
      <DraggableTableContext.Provider value={draggableTable}>
        {/* <FocusProvider> */}
          {selectedDataSet && renderTable()}
        {/* </FocusProvider> */}
      </DraggableTableContext.Provider>
    </div>
  );
};

export default NestedTable;
