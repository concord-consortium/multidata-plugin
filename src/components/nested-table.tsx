import React, { useCallback, useEffect, useState } from "react";
import { InteractiveState } from "../hooks/useCodapState";
import { ICollection, IProcessedCaseObj, Values, ICollectionClass, IDataSet,
         ICollections, CaseValuesWithId } from "../types";
import { PortraitView } from "./portrait-view";
import { Menu } from "./menu";
import { LandscapeView } from "./landscape-view";
import { FlatTable } from "./flat-table";
import { DraggableTableContext, useDraggableTable } from "../hooks/useDraggableTable";
import { DraggagleTableData, DraggagleTableHeader } from "./draggable-table-tags";

import css from "./nested-table.scss";

const portrait = "Portrait";
const landscape = "Landscape";
const none = "";

interface IProps {
  selectedDataSet: any;
  dataSets: IDataSet[];
  collections: ICollections;
  cases: CaseValuesWithId[];
  interactiveState: InteractiveState
  handleSelectDataSet: (e: React.ChangeEvent<HTMLSelectElement>) => void
  updateInteractiveState: (update: Partial<InteractiveState>) => void
  handleShowComponent: () => void
  handleSetCollections: (collections: Array<ICollection>) => void
  handleUpdateAttributePosition: (collection: ICollection, attrName: string, newPosition: number) => void
  handleCreateCollectionFromAttribute: (collection: ICollection, attr: any, parent: number|string) => Promise<void>
  handleUpdateCollections: () => void
}

export const NestedTable = (props: IProps) => {
  const {selectedDataSet, dataSets, collections, cases, interactiveState,
         handleSelectDataSet, updateInteractiveState, handleShowComponent,
         handleSetCollections, handleUpdateAttributePosition,
         handleCreateCollectionFromAttribute, handleUpdateCollections} = props;
  const [collectionClasses, setCollectionClasses] = useState<Array<ICollectionClass>>([]);
  const [paddingStyle, setPaddingStyle] = useState<Record<string, string>>({padding: "0px"});

  const draggableTable = useDraggableTable({
    collections,
    handleSetCollections,
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
  }, [collections]);

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

  const handleSelectDisplayMode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateInteractiveState({displayMode: e.target.value});
  }, [updateInteractiveState]);

  const mapHeadersFromValues = (collectionId: number, rowKey: string, values: Values,
      attrVisibilities: Record<string, boolean>) => {
    return (
      <>
        {(Object.keys(values)).map((key, index) => {
          if (!attrVisibilities[key] && (typeof values[key] === "string" || typeof values[key] === "number")) {
            return (
              <DraggagleTableHeader
                key={`${collectionId}-${rowKey}-${key}-${index}`}
                collectionId={collectionId}
                attrTitle={key}
                dataSetName={selectedDataSet.name}
                dataSetTitle={selectedDataSet.title}
              >{key}
              </DraggagleTableHeader>
            );
          }
        })}
      </>
    );
  };

  const mapCellsFromValues = (collectionId: number, rowKey: string, aCase: Values,
      precisions: Record<string, number>, attrTypes: Record<string, string | undefined | null>,
      attrVisibilities: Record<string, boolean>, isParent?: boolean, resizeCounter?: number, parentLevel?: number) => {
    return Object.keys(aCase).map((key, index) => {
      if (key === "id") return null;

      const isWholeNumber = aCase[key] % 1 === 0;
      const precision = precisions[key];
      // Numbers are sometimes passed in from CODAP as a string so we use the attribute type to
      // determine if it should be parsed as a number.
      // Numbers that are whole numbers are treated as integers, so we should ignore the precision.
      // Numeric cells that are empty should be treated as empty strings.
      const isNumericType = attrTypes[key] === "numeric";
      const hasValue = aCase[key] !== "";
      const parsedValue = parseFloat(aCase[key]);
      const isNumber = !isNaN(parsedValue);
      const hasPrecision = precision !== undefined;
      const defaultValue = aCase[key];
      const isNumberType = typeof aCase[key] === "number";
      let val;
      if (isNumericType && hasValue && isNumber) {
          val = isWholeNumber ? parseInt(aCase[key], 10)
                              : parsedValue.toFixed(hasPrecision ? precision : 2);
      } else if (!isNumericType && isNumberType && hasValue) {
          val = defaultValue.toFixed(hasPrecision ? precision : 2);
      } else {
          val = defaultValue;
      }

      if (attrVisibilities[key]) {
        return null;
      }
      if (typeof val === "string" || typeof val === "number") {
        return (
          <DraggagleTableData
            collectionId={collectionId}
            attrTitle={key}
            key={`${rowKey}-${val}-${index}}`}
            isParent={isParent}
            caseId={aCase.id}
            resizeCounter={resizeCounter}
            parentLevel={parentLevel}
            selectedDataSetName={selectedDataSet.name}
            handleUpdateCollections={handleUpdateCollections}
          >
            {val}
          </DraggagleTableData>
        );
      }
    });
  };

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
    const classesExist = collectionClasses.length > 0;
    const tableProps = {showHeaders: interactiveState.showHeaders, collectionClasses, collections, selectedDataSet,
      getClassName, mapHeadersFromValues, mapCellsFromValues, getValueLength, paddingStyle, handleUpdateCollections};
    const flatProps = {...tableProps, cases};
    if (isNoHierarchy && classesExist) {
      return <FlatTable {...flatProps}/>;
    } else {
      return (
        interactiveState.displayMode === portrait ?
          <PortraitView {...tableProps} /> :
          interactiveState.displayMode === landscape ?
          <LandscapeView {...tableProps} /> :
          <div/>
      );
    }
  };

  const showDisplayMode = collections.length > 1 && selectedDataSet;

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
      />
      <DraggableTableContext.Provider value={draggableTable}>
        {selectedDataSet && renderTable()}
      </DraggableTableContext.Provider>
    </div>
  );
};

export default NestedTable;
