import React, { useRef, useState } from "react";
import { ICollection, INestedTableProps, IProcessedCaseObj, Values } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";
import { TableScrollTopContext, useTableScrollTop } from "../hooks/useTableScrollTop";
import { getAttrPrecisions, getAttrTypes, getAttrVisibility } from "../utils/utils";

import css from "./tables.scss";
import { TableHeaders } from "./table-headers";
import { useCodapContext } from "./CodapContext";
import { TableCell } from "./table-cell";

interface IPortraitViewRowProps extends INestedTableProps {
  collectionId: number;
  caseObj: IProcessedCaseObj;
  index?: number | null;
  precisions: Record<string, number>;
  attrTypes: Record<string, string | undefined | null>;
  attrVisibilities: Record<string, boolean>;
  isParent: boolean;
  parentLevel?: number;
}

export const PortraitViewRow = (props: IPortraitViewRowProps) => {
  const {paddingStyle, precisions, attrTypes, attrVisibilities,
    collectionId, caseObj, index, isParent, parentLevel, getClassName} = props;

  const { interactiveState } = useCodapContext();

  const {children, id, values} = caseObj;
  const caseValuesWithId: Values = {...values, id};

  if (!children.length) {
    return (
      <tr>
        {Object.keys(caseValuesWithId).map((key, i) => {
          return (
            <TableCell
              key={`${key}-${i}`}
              index={i}
              caseId={caseValuesWithId.id}
              attributeName={key}
              rowKey={`row-${index}`}
              collectionId={collectionId}
              cellValue={caseValuesWithId[key]}
              attrType={attrTypes[key]}
              precision={precisions[key]}
              isHidden={attrVisibilities[key]}
            />
          )
        })}
      </tr>
    );
  } else {
    return (
      <>
        {index === 0 &&
          <tr className={`${css[getClassName(caseObj)]}`}>
            <TableHeaders
              collectionId={collectionId}
              rowKey={`first-row-${index}`}
              values={values}
              attrVisibilities={attrVisibilities}
            />
            {interactiveState?.showHeaders ? (
                <DroppableTableHeader collectionId={collectionId}>{children[0].collection.name}</DroppableTableHeader>
              ) : <th />}
          </tr>
        }
        <tr className={`${css[getClassName(caseObj)]} parent-row`}>
          {Object.keys(caseValuesWithId).map((key, i) => (
            <TableCell
              key={`${caseValuesWithId}-${i}`}
              index={i}
              caseId={caseValuesWithId.id}
              attributeName={key}
              rowKey={`parent-row-${index}`}
              collectionId={collectionId}
              cellValue={caseValuesWithId[key]}
              attrType={attrTypes[i]}
              precision={precisions[i]}
              isHidden={attrVisibilities[key]}
            />
          ))}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: IPortraitViewRowProps = {
                      ...props,
                      collectionId: child.collection.id,
                      caseObj: child,
                      index: i,
                      isParent,
                      parentLevel: parentLevel !== undefined && parentLevel !== null ? parentLevel + 1 : undefined,
                    };
                    if (i === 0 && !child.children.length) {
                      return (
                        <React.Fragment key={child.collection.id}>
                          <tr className={`${css[getClassName(child)]}`}>
                            <TableHeaders
                              collectionId={child.collection.id}
                              rowKey={`child-row-${index}-${i}`}
                              values={child.values}
                              attrVisibilities={attrVisibilities}
                            />
                          </tr>
                          <PortraitViewRow {...nextProps} />
                        </React.Fragment>
                      );
                    } else {
                      return <PortraitViewRow key={child.id} {...nextProps} />;
                    }
                  })}
                </tbody>
              </table>
            </DraggableTableContainer>
          </DroppableTableData>
        </tr>
      </>
    );
  }
};

export const PortraitView = (props: INestedTableProps) => {
  const { getValueLength } = props;
  const { collections, selectedDataSet } = useCodapContext();
  const tableRef = useRef<HTMLTableElement | null>(null);
  const tableScrollTop = useTableScrollTop(tableRef);

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const className = "collections0";
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
    const precisions = getAttrPrecisions(collections);
    const attrTypes = getAttrTypes(collections);
    const attrVisibilities = getAttrVisibility(collections);

    return (
      <DraggableTableContainer>
        <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`} ref={tableRef}>
          <tbody className={`table-body ${css[className]}`}>
            <tr className={css.mainHeader}>
              <th className={css.datasetNameHeader} colSpan={valueCount}>{selectedDataSet.name}</th>
            </tr>
            <tr className={css[className]}>
              <th colSpan={valueCount}>{parentColl.name}</th>
            </tr>
            {parentColl.cases.map((caseObj, index) => (
              <PortraitViewRow
                key={caseObj.id}
                {...props}
                collectionId={caseObj.collection.id}
                caseObj={caseObj}
                index={index}
                precisions={precisions}
                attrTypes={attrTypes}
                attrVisibilities={attrVisibilities}
                isParent={true}
                parentLevel={0}
              />
            ))}
          </tbody>
        </table>
      </DraggableTableContainer>
    );
  };

  return (
    <TableScrollTopContext.Provider value={tableScrollTop}>
      <div className={css.portraitTableContainer}>
        {collections.length && renderTable()}
      </div>
    </TableScrollTopContext.Provider>
  );
};
