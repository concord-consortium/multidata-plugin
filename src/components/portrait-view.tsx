import React, { useEffect, useMemo, useState } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";

import css from "./tables.scss";

export const PortraitView = (props: ITableProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections, getValueLength} = props;
  const thresh = useMemo(() => {
    const t: number[] = [];
    for (let i = 0; i <= 100; i++) {
      t.push(i / 100);
    }
    return t;
  },[]);

  const [scrolling, setScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const onScroll = (e: any) => {
      setScrollTop(e.target.documentElement.scrollTop);
      setScrolling(e.target.documentElement.scrollTop > scrollTop);
    };
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollTop]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const entryRect = target.getBoundingClientRect();
        const entryHeight = entryRect.height;
        const intersectionRect = entry.intersectionRect;
        const visibleHeight = intersectionRect.height;
        const intersectionHeightRatio = visibleHeight/entryHeight;
        const cells = Array.from(target.querySelectorAll<HTMLElement>(".parent-data"));

        if (cells) {
          cells.forEach(cell => {
            cell.style.position = "relative";
            if (entry.isIntersecting && intersectionHeightRatio < 0.85) {
              if (intersectionRect.top === 0) { //we're in the bottom part of the visible rect
                cell.style.verticalAlign = "top";
                cell.style.top = `${(visibleHeight/2) - entryRect.top - 16}px`;
                cell.style.verticalAlign = "top";
                cell.style.top = `${visibleHeight/2}px`;
              }
            } else {
              cell.style.top = "0";
              cell.style.verticalAlign = "middle";
            }
          });
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersection, { threshold: thresh });
    document.querySelectorAll(".parent-row").forEach((cell) => {
      observer.observe(cell);
    });
    return () => {
      // Clean up the observer when the component unmounts
      document.querySelectorAll(".parent-row").forEach((cell) => {
        observer.unobserve(cell);
      });
    };
  }, [scrollTop, scrolling, thresh]);

  const renderNestedTable = (parentColl: ICollection) => {
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);
    const {className} = collectionClasses[0];
    return (
      <>
        <tr className={css.mainHeader}>
          <th colSpan={valueCount}>{selectedDataSet.name}</th>
        </tr>
        <tr className={css[className]}>
          <th colSpan={valueCount}>{parentColl.name}</th>
        </tr>
        {parentColl.cases.map((caseObj, index) => renderRowFromCaseObj(caseObj.collection.id, caseObj, index, true))}
      </>
    );
  };

  const renderRowFromCaseObj = (collectionId: number, caseObj: IProcessedCaseObj,
                                  index?: null|number, isParent?: boolean) => {
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
              {showHeaders && (
                <DroppableTableHeader collectionId={collectionId}>{children[0].collection.name}</DroppableTableHeader>
              )}
            </tr>
          }
          <tr className={`${css[getClassName(caseObj)]} parent-row`}>
            {mapCellsFromValues(collectionId, `parent-row-${index}`, values, isParent)}
            <DroppableTableData collectionId={collectionId} style={paddingStyle}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0 && !child.children.length) {
                      return (
                        <>
                          <tr key={child.collection.name} className={`${css[getClassName(child)]}`}>
                            {mapHeadersFromValues(child.collection.id, `child-row-${index}-${i}`, child.values)}
                          </tr>
                          {renderRowFromCaseObj(child.collection.id, child, i)}
                        </>
                      );
                    } else {
                      return (renderRowFromCaseObj(child.collection.id, child, i, isParent));
                    }
                  })}
                </tbody>
              </table>
            </DroppableTableData>
          </tr>
        </>
      );
    }
  };

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent);
    const {className} = collectionClasses[0];
    return (
      <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`}>
        <tbody>
          {renderNestedTable(parentColl[0])}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {collections.length && collectionClasses.length && renderTable()}
    </div>
  );
};
