import React, { useEffect, useMemo } from "react";
import { ICollection, IProcessedCaseObj, ITableProps } from "../types";
import { DraggableTableContainer, DroppableTableData, DroppableTableHeader } from "./draggable-table-tags";

import css from "./tables.scss";

export type PortraitViewRowProps =
  {collectionId: number, caseObj: IProcessedCaseObj, index?: null|number, isParent: boolean} & ITableProps;

export const PortraitViewRow = (props: PortraitViewRowProps) => {
  const {paddingStyle, mapCellsFromValues, mapHeadersFromValues, showHeaders,
    getClassName, collectionId, caseObj, index, isParent} = props;

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
          {mapCellsFromValues(collectionId, `parent-row-${index}`, values, isParent)}
          <DroppableTableData collectionId={collectionId} style={paddingStyle}>
            <DraggableTableContainer collectionId={collectionId}>
              <table style={paddingStyle} className={`${css.subTable} ${css[getClassName(children[0])]}`}>
                <tbody>
                  {caseObj.children.map((child, i) => {
                    const nextProps: PortraitViewRowProps = {
                      ...props,
                      collectionId: child.collection.id,
                      caseObj: child,
                      index: i,
                      isParent
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
  const thresh = useMemo(() => {
    const t: number[] = [];
    for (let i = 0; i <= 100; i++) {
      t.push(i / 100);
    }
    return t;
  },[]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const entryRect = target.getBoundingClientRect();
        const entryHeight = entryRect.height;
        const intersectionRect = entry.intersectionRect;
        const visibleHeight = intersectionRect.height;
        const visibleTop = intersectionRect.top;
        const intersectionHeightRatio = visibleHeight/entryHeight;
        const cells = Array.from(target.querySelectorAll<HTMLElement>(".parent-data"));
        if (cells) {
          cells.forEach(cell => {
            const cellTop = cell.getBoundingClientRect().top;
            const dataCellHeight = cell.clientHeight;
            const dataTextValue = cell.querySelector<HTMLElement>(".data-text-value");
            const textHeight = dataTextValue?.getBoundingClientRect().height || 16;
            const visiblePortion = Math.min(dataCellHeight, window.innerHeight - cell.getBoundingClientRect().top);
            // console.log(target.textContent, "target entryRect top", entryRect.top);
            // console.log(cell.textContent, "visibleHeight", visibleHeight);
            console.log(cell.textContent, "visibleTop", visibleTop);
            console.log(cell.textContent, "visiblePortion", visiblePortion);
            // console.log(cell.textContent, "intersectionRect.top", intersectionRect.top, "cellTop",
            // cellTop);
            console.log(cell.textContent, "cellTop", cellTop);
            console.log(cell.textContent, "dataCellHeight", dataCellHeight);
            let textTopPosition = 0;

            if (dataTextValue) {
              dataTextValue.style.position = "relative";
              // console.log(cell.textContent, "isIntersecting", entry.isIntersecting,
                //  "intersectionHeightRatio", intersectionHeightRatio);
              if (dataCellHeight <= visibleHeight) {
                // console.log(cell.textContent, "WHOLE CELL IS VISIBLE");
                textTopPosition = 0;
              } else
              if (entry.isIntersecting && intersectionHeightRatio < 0.95) {
                if (cellTop < intersectionRect.top/2) { //we're in the bottom part of the visible rect
                  console.log(cell.textContent, "BOTTOM PART");
                  // textTopPosition = (visibleHeight/2) - entryRect.top - 16;
                  // textTopPosition = (dataCellHeight / 2) + cellTop - textHeight;
                  textTopPosition = Math.min((dataCellHeight/2 - textHeight), visibleTop - (cellTop) + textHeight);
                  // textTopPosition = ((dataCellHeight - visiblePortion) / 2) - textHeight;
                } else { //we're in the top part of the visible rect
                  console.log(cell.textContent, "TOP PART");
                  // dataTextValue.style.top = `${visibleHeight/2}px`;
                  textTopPosition = Math.max((-dataCellHeight/2) + textHeight,
                                             (visiblePortion - dataCellHeight) / 2 + textHeight);
                }
              }
              // console.log(cell.textContent, "textTopPositon", textTopPosition);
              console.log(cell.textContent, "*****************************************************");
              dataTextValue.style.top = `${textTopPosition}px`;
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
      document.querySelectorAll(".parent-row").forEach((cell) => {
        observer.unobserve(cell);
      });
    };
  }, []);

  const renderTable = () => {
    const parentColl = collections.filter((coll: ICollection) => !coll.parent)[0];
    const {className} = collectionClasses[0];
    const firstRowValues = parentColl.cases.map(caseObj => caseObj.values);
    const valueCount = getValueLength(firstRowValues);

    return (
      <DraggableTableContainer>
        <table className={`${css.mainTable} ${css.portraitTable} ${css[className]}`}>
          <tbody>
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
              />
            ))}
          </tbody>
        </table>
      </DraggableTableContainer>
    );
  };

  return (
    <div className={css.portraitTableContainer}>
      {collections.length && collectionClasses.length && renderTable()}
    </div>
  );
};
