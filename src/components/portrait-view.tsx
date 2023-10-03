import React, { useEffect, useState } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";

import css from "./tables.scss";

export const PortraitView = (props: ITableProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections, getValueLength} = props;
  const thresh: number[] = [];
  for (let i = 0; i <= 100; i++) {
    thresh.push(i / 100);
  }
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
        const visibleRect = entry.intersectionRect;
        const firstChild = target.firstElementChild as HTMLElement | null;

        if (firstChild) {
          firstChild.style.position = "relative";
          if (entry.isIntersecting) {
            if (visibleRect.top === 0 ) { //we're in the bottom part of the visible rect
              firstChild.style.top = `${((visibleRect.height - 32)/2) - entryRect.top}px`;
              firstChild.style.verticalAlign = "top";
            } else { //we're in the top part of the visible rect
              firstChild.style.top = `${visibleRect.height/2}px`;
              firstChild.style.verticalAlign = "top";
              if (entryRect.height > window.innerHeight) {
                firstChild.style.maxHeight = `${visibleRect.height}px`;
              }
            }
          }
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
        {parentColl.cases.map((caseObj, index) => renderRowFromCaseObj(caseObj, index))}
      </>
    );
  };

  const renderRowFromCaseObj = (caseObj: IProcessedCaseObj, index?: null|number) => {
    const {children, values} = caseObj;
    if (!children.length) {
      return (
          <tr>{mapCellsFromValues(values)}</tr>
      );
    } else {
      return (
        <>
          {index === 0 ?
            <tr className={`${css[getClassName(caseObj)]}`}>
              {mapHeadersFromValues(values)}
              <th>{showHeaders ? children[0].collection.name : ""}</th>
            </tr> : ""
          }
          <tr className={`${css[getClassName(caseObj)]} parent-row`}>
            {mapCellsFromValues(values)}
            <td style={paddingStyle}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    if (i === 0 && !child.children.length) {
                      return (
                        <>
                          <tr key={child.collection.name} className={`${css[getClassName(child)]}`}>
                            {mapHeadersFromValues(child.values)}
                          </tr>
                          {renderRowFromCaseObj(child, i)}
                        </>
                      );
                    } else {
                      return (renderRowFromCaseObj(child, i));
                    }
                  })}
                </tbody>
              </table>
            </td>
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
