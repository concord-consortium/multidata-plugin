import React from "react";
import { IBoundingBox } from "../../types";
import css from "./arrows.scss";

const CollectionGap = 23;
const AttrsGap = 10;
const CollectionOffset = 15;
const StrokeWidth = 2;
const StrokeColor = "#979797";

const HalfStrokeWidth = StrokeWidth / 2;
const HalfCollectionGap = CollectionGap / 2;

interface IArrows {
  levelBBox: IBoundingBox;
}

export const AttrsArrow = ({levelBBox}: IArrows) => {
  const {top, left, width, height} = levelBBox;
  const style: React.CSSProperties = {left: left + (width / 2), top: top + height};
  const path = `M ${HalfStrokeWidth} 0 L ${HalfStrokeWidth} ${AttrsGap}`;

  return (
    <svg className={css.attrsArrow} style={style} xmlns="http://www.w3.org/2000/svg" width={StrokeWidth} height={AttrsGap} viewBox={`0 0 ${StrokeWidth} ${AttrsGap}`}>
      <path d={path} stroke={StrokeColor} strokeWidth={StrokeWidth} />
    </svg>
  );
};

export const LevelArrow = ({levelBBox}: {levelBBox: IBoundingBox}) => {
  const {top, left, width, height} = levelBBox;
  const style: React.CSSProperties = {left: left + width, top: top + height / 2};
  const path = [
    `M 0 ${HalfStrokeWidth}`,
    `L ${HalfCollectionGap} ${HalfStrokeWidth}`,
    `L ${HalfCollectionGap} ${CollectionOffset - HalfStrokeWidth}`,
    `L ${CollectionGap} ${CollectionOffset - HalfStrokeWidth}`
  ].join(" ");

  return (
    <svg className={css.levelArrow} style={style} xmlns="http://www.w3.org/2000/svg" width={CollectionGap} height={CollectionOffset} viewBox={`0 0 ${CollectionGap} ${CollectionOffset}`}>
      <path d={path} stroke={StrokeColor} strokeWidth={StrokeWidth} fill="transparent" />
    </svg>
  );
};
