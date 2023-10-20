import React, { useCallback, useEffect, useMemo } from "react";
import { useDraggableTableContext, Side } from "../hooks/useDraggableTable";

import AddIcon from "../assets/plus-level-1.svg";

import css from "./tables.scss";

const highlightColor = "#FBF719";

const border = `5px solid ${highlightColor}`;
const borderLeft = border;
const borderRight = border;

const getStyle = (id: string, dragOverId?: string, dragSide?: Side) => {
  return id === dragOverId ? (dragSide === "left" ? {borderLeft} : {borderRight}) : {};
};

const getIdAndStyle = (collectionId: number, attrTitle: string, dragOverId?: string, dragSide?: Side)
  : {id: string, style: React.CSSProperties} => {
  const id = `${collectionId}-${attrTitle}`;
  const style = getStyle(id, dragOverId, dragSide);
  return { id, style };
};

interface DraggagleTableHeaderProps {
  collectionId: number;
  attrTitle: string;
  colSpan?: number;
}

export const DraggagleTableHeader: React.FC<DraggagleTableHeaderProps> = ({collectionId, attrTitle, children}) => {
  const {dragOverId, dragSide, handleDragStart, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave, handleDragEnd} = useDraggableTableContext();
  const {id, style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);

  return (
    <th
      data-id={id}
      style={style}
      draggable={true}
      className={css.draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
    >
      {children}
    </th>
  );
};

interface DroppableTableHeaderProps {
  collectionId: number;
}

export const DroppableTableHeader: React.FC<DroppableTableHeaderProps> = ({collectionId, children}) => {
  const {dragOverId, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave} = useDraggableTableContext();

  const id = `${collectionId}`;
  const style = getStyle(id, dragOverId, "left");

  return (
    <th
      data-id={id}
      style={style}
      onDragOver={handleDragOver}
      onDrop={handleOnDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {children}
    </th>
  );
};

interface DraggagleTableDataProps {
  collectionId: number;
  attrTitle: string;
  style?: React.CSSProperties;
  isParent?: boolean;
}

export const DraggagleTableData: React.FC<DraggagleTableDataProps>
                = ({collectionId, attrTitle, children, isParent}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const {style} = getIdAndStyle(collectionId, attrTitle, dragOverId, dragSide);
  const thresh = useMemo(() => {
    const t: number[] = [];
    for (let i = 0; i <= 100; i++) {
      t.push(i/100);
    }
    return t;
  },[]);

  const positionDataCellValue = useCallback(()=>{
    const cell = document.querySelector<HTMLElement>(css.parentData);
    function calculateVisibilityForDiv(div$) {
      var windowHeight = $(window).height(),
          docScroll = $(document).scrollTop(),
          divPosition = div$.offset().top,
          divHeight = div$.height(),
          hiddenBefore = docScroll - divPosition,
          hiddenAfter = (divPosition + divHeight) - (docScroll + windowHeight);

      if ((docScroll > divPosition + divHeight) || (divPosition > docScroll + windowHeight)) {
          return 0;
      } else {
          var result = 100;

          if (hiddenBefore > 0) {
              result -= (hiddenBefore * 100) / divHeight;
          }

          if (hiddenAfter > 0) {
              result -= (hiddenAfter * 100) / divHeight;
          }

          return result;
      }
  }
    // if (cells) {
    //   cells.forEach(cell => {
        // // cell.textContent==="Wooden" && console.log("in handleIntersection Wooden",entry);
        // // console.log(cell.textContent, "intersectionRatio", entry.intersectionRatio);
        // const cellRect = cell.getBoundingClientRect();
        // const cellTop = cellRect.top;
        // const dataCellHeight = cellRect.height;
        // const dataTextValue = cell.querySelector<HTMLElement>(".data-text-value");
        // const textHeight = dataTextValue?.getBoundingClientRect().height || 16;
        // const visiblePortion = Math.min(dataCellHeight, window.innerHeight - cell.getBoundingClientRect().top);
        // // console.log(cell.textContent, "target entryRect top", entryRect.top);
        // // console.log(cell.textContent, "visibleHeight", visibleHeight);
        // // console.log(cell.textContent, "intersectionRect bounds", intersectionRect);
        // // console.log(cell.textContent, "visibleTop", visibleTop);
        // // console.log(cell.textContent, "visiblePortion", visiblePortion);
        // // console.log(cell.textContent, "intersectionRect.top", intersectionRect.top, "cellTop",
        // // cellTop);
        // // console.log(cell.textContent, "cellTop", cellTop);
        // // console.log(cell.textContent, "dataCellHeight", dataCellHeight);
        // // console.log(cell.textContent, "window.innerHeight", window.innerHeight);
        // let textTopPosition = 0;

        // if (dataTextValue) {
        //   dataTextValue.style.position = "relative";
        //   if (dataCellHeight <= visiblePortion) { // Center value if whole cell is visible
        //     textTopPosition = 0;
        //   }
        //   // else
        //   // if (entry.isIntersecting && intersectionHeightRatio < 0.95) {
        //   //   if (cellTop < intersectionRect.top/2) { //we're in the bottom part of the visible rect
        //   //     // console.log(cell.textContent, "BOTTOM PART");
        //   //     textTopPosition = Math.min((dataCellHeight/2 - textHeight), visibleTop - (cellTop) + textHeight);
        //   //   } else { //we're in the top part of the visible rect
        //   //     // console.log(cell.textContent, "TOP PART");
        //   //     textTopPosition = Math.max((-dataCellHeight/2) + textHeight,
        //   //                                (visiblePortion - dataCellHeight) / 2 + textHeight);
        //   //   }
        //   // }
        //   // console.log(cell.textContent, "textTopPositon", textTopPosition);
        //   // console.log(cell.textContent, "*****************************************************");
        //   dataTextValue.style.top = `${textTopPosition}px`;
        // }
    //   });
    // }
  },[]);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[], o: any) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const entryRect = target.getBoundingClientRect();
        const entryHeight = entryRect.height;
        const intersectionRect = entry.intersectionRect;
        const visibleHeight = intersectionRect.height;
        const visibleTop = intersectionRect.top;
        const intersectionHeightRatio = visibleHeight/entryHeight;
        const cells = Array.from(target.querySelectorAll<HTMLElement>(css.parentData));
        if (cells) {
          cells.forEach(cell => {
            console.log(cell.textContent, "intersectionRatio", entry.intersectionRatio);
            const cellRect = cell.getBoundingClientRect();
            const cellTop = cellRect.top;
            const dataCellHeight = cell.clientHeight;
            const dataTextValue = cell.querySelector<HTMLElement>(".data-text-value");
            const textHeight = dataTextValue?.getBoundingClientRect().height || 16;
            const visiblePortion = Math.min(dataCellHeight, window.innerHeight - cell.getBoundingClientRect().top);
            console.log(cell.textContent, "target entryRect top", entryRect.top);
            console.log(cell.textContent, "visibleHeight", visibleHeight);
            console.log(cell.textContent, "intersectionRect bounds", intersectionRect);
            console.log(cell.textContent, "visibleTop", visibleTop);
            console.log(cell.textContent, "visiblePortion", visiblePortion);
            console.log(cell.textContent, "intersectionRect.top", intersectionRect.top, "cellTop",
            cellTop);
            console.log(cell.textContent, "cellTop", cellTop);
            console.log(cell.textContent, "dataCellHeight", dataCellHeight);
            console.log(cell.textContent, "window.innerHeight", window.innerHeight);
            let textTopPosition = 0;

            if (dataTextValue) {
              dataTextValue.style.position = "absolute";
              // console.log(cell.textContent, "isIntersecting", entry.isIntersecting,
                //  "intersectionHeightRatio", intersectionHeightRatio);
              if (dataCellHeight <= visibleHeight) {
                // console.log(cell.textContent, "WHOLE CELL IS VISIBLE");
                textTopPosition = 0;
              } else
              if (entry.isIntersecting && intersectionHeightRatio < 0.95) {
                if (cellTop < intersectionRect.top/2) { //we're in the bottom part of the visible rect
                  // console.log(cell.textContent, "BOTTOM PART");
                  textTopPosition = Math.min((dataCellHeight/2 - textHeight), visibleTop - (cellTop) + textHeight);
                } else { //we're in the top part of the visible rect
                  // console.log(cell.textContent, "TOP PART");
                  textTopPosition = Math.max((-dataCellHeight/2) + textHeight,
                                             (visiblePortion - dataCellHeight) / 2 + textHeight);
                }
              }
              // console.log(cell.textContent, "textTopPositon", textTopPosition);
              // console.log(cell.textContent, "*****************************************************");
              dataTextValue.style.top = `${textTopPosition}px`;
            }
          });
        }
      });
    };
    const observer = new IntersectionObserver(handleIntersection, {threshold: thresh});
    document.querySelectorAll(".parent-row").forEach((row) => {
      observer.observe(row);
    });
    return () => {
      document.querySelectorAll(".parent-row").forEach((row) => {
        observer.unobserve(row);
      });
    };
  }, [thresh]);

  return (
    <td style={style} className={`draggable-table-data ${isParent ? css.parentData : ""}`}>
      {isParent
        ? <div className="data-text-value">{children}</div>
        : children
      }
    </td>
  );
};

interface DroppableTableDataProps {
  collectionId: number;
  style?: React.CSSProperties;
}

export const DroppableTableData: React.FC<DroppableTableDataProps> = ({collectionId, style, children}) => {
  const {dragOverId, dragSide} = useDraggableTableContext();
  const dragStyle = getStyle(`${collectionId}`, dragOverId, dragSide);

  return (
    <td style={{...dragStyle, ...style}} className="droppable-table-data">
      {children}
    </td>
  );
};

interface DraggableTableContainerProps {
  collectionId?: number|string;
}

export const DraggableTableContainer: React.FC<DraggableTableContainerProps> = ({collectionId, children}) => {
  const {dragging, dragOverId, handleDragOver, handleOnDrop, handleDragEnter,
    handleDragLeave} = useDraggableTableContext();


  const id = collectionId ? `parent:${collectionId}` : `parent:root`;
  const hovering = id === dragOverId;
  const style: React.CSSProperties = {
    display: dragging ? "table-cell" : "none",
    backgroundColor: hovering ? highlightColor : undefined,
  };

  return (
    <table key={collectionId} className={css.draggableTableContainer}>
      <tbody>
        <tr>
          <td
            className={css.draggableTableContainerDropTarget}
            data-id={id}
            style={style}
            onDragOver={handleDragOver}
            onDrop={handleOnDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <AddIcon />
            {hovering && <div>Drop to create new collection</div>}
          </td>
          <td className={css.draggableTableContainerChildren}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
};


