import React, { useEffect, useMemo, useRef, useState } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";
import { TableScrollTopContext, useTableScrollTop } from "../hooks/useTableScrollTop";

import css from "./tables.scss";

export type PortraitViewRowProps = {collectionId: number, caseObj: IProcessedCaseObj, index?: null|number,
                                    isParent: boolean, resizeCounter: number, parentLevel?: number}
                                    & ITableProps;

export const PortraitViewRow = (props: PortraitViewRowProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders,
          getClassName, collectionId, caseObj, index, isParent, resizeCounter, parentLevel} = props;

  const {children, values} = caseObj;

  if (!children.length) {
    return (
        <tr>{mapCellsFromValues(collectionId, `row-${index}`, values)}</tr>
    );
  } else {
    return (
      <>
        {index === 0 &&
          <tr className={`${css[getClassName(caseObj)]}`}>
            {mapHeadersFromValues(collectionId, `first-row-${index}`, values)}
            {showHeaders ? (
                <DroppableTableHeader collectionId={collectionId}>{children[0].collection.name}</DroppableTableHeader>
              ) : <th />}
          </tr>
        }
        <tr className={`${css[getClassName(caseObj)]} parent-row`}>
          {mapCellsFromValues(collectionId, `parent-row-${index}`, values, isParent, resizeCounter, parentLevel)}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody className={`table-body ${css[getClassName(children[0])]}`}>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
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
                            {mapHeadersFromValues(child.collection.id, `child-row-${index}-${i}`, child.values)}
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

export const PortraitView = (props: ITableProps) => {
  const {collectionClasses, selectedDataSet, collections, getValueLength} = props;
  const tableRef = useRef<HTMLTableElement | null>(null);
  const tableScrollTop = useTableScrollTop(tableRef);
  const [resizeCounter, setResizeCounter] = useState(0);

  const thresh = useMemo(() => {
    const t: number[] = [];
    for (let i = 0; i <= 100; i++) {
      t.push(i/100);
    }
    return t;
  }, []);


  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[], o: any) => {
      setResizeCounter((prevState) => prevState + 1);
    };
    const observer = new IntersectionObserver(handleIntersection, {threshold: thresh});
    document.querySelectorAll(`.parent-row`).forEach((row) => {
      observer.observe(row);
    });
    return () => {
      document.querySelectorAll(`.parent-row`).forEach((row) => {
        observer.unobserve(row);
      });
    };

  }, [thresh]);

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const {className} = collectionClasses[0];
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);

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
                isParent={true}
                resizeCounter={resizeCounter}
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
        {collections.length && collectionClasses.length && renderTable()}
      </div>
    </TableScrollTopContext.Provider>
  );
};
