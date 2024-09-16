import React from "react";
import { DraggagleTableHeader } from "./draggable-table-tags";
import { Values } from "../types";
import { useCodapContext } from "./CodapContext";

interface MapHeadersFromValuesProps {
  collectionId: number;
  rowKey: string;
  values: Values;
  attrVisibilities: Record<string, boolean>;
}

export const TableHeaders: React.FC<MapHeadersFromValuesProps> = ({
  collectionId,
  rowKey,
  values,
  attrVisibilities
}) => {
  const { selectedDataSet } = useCodapContext();
  return (
    <>
      {Object.keys(values).map((key, index) => {
        if (!attrVisibilities[key] && (typeof values[key] === "string" || typeof values[key] === "number")) {
          console.log("Rendering header for key:", key); // Debugging log
          return (
            <DraggagleTableHeader
              key={`${collectionId}-${rowKey}-${key}-${index}`}
              collectionId={collectionId}
              attrTitle={key}
              dataSetName={selectedDataSet.name}
              dataSetTitle={selectedDataSet.title}
            >
              {key}
            </DraggagleTableHeader>
          );
        }
        return null; // Return null if the condition is not met
      })}
    </>
  );
};
