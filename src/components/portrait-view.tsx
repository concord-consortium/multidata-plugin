import React, { useEffect, useState } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";

import css from "./tables.scss";

export const PortraitView = (props: ITableProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders, collectionClasses,
    getClassName, selectedDataSet, collections, getValueLength} = props;
    const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const thresh = [];
    for (let i = 0; i <= 100; i++) {
      thresh.push(i / 100);
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
        const target = entry.target;
        const entryRect = target.getBoundingClientRect();
        const top = entryRect.top;
        const height = entryRect.height;
        // const width = entryRect.width;
        const firstChild = target.firstElementChild as HTMLElement | null;
        // const firstChildWidth = firstChild?.getBoundingClientRect().width;
        let halfPos;
        if (firstChild) {
          if (entry.intersectionRatio >= 0.85 || entry.intersectionRatio <= 0.15) {
            firstChild.style.position = "relative";
            firstChild.style.top = "50%";
            firstChild.style.borderWidth = "1px";
          } else {
            firstChild.style.position = "fixed";
            if (top > 0) {
              halfPos = top + (window.innerHeight - top) / 2;
            } else {
              halfPos = (top + height) / 2;
            }
            firstChild.style.top = `${halfPos}px`;
            firstChild.style.height = `${(entry.intersectionRect.height - halfPos - 4.5)}px`;
            if (firstChild.style.position === "relative") {firstChild.style.borderWidth = "1";}
              else {firstChild.style.borderWidth = "0";}
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
  }, [isVisible]);

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
