import { IAttribute } from "../types";

export const getDisplayValue = (cellValue: string | number, attrTitle: string,
  attrTypes: Record<string, string | undefined | null>, precisions: Record<string, number>) => {
    let displayValue: string|number;
    const isAttrNumberType = attrTypes[attrTitle] === "numeric";
    const cellHasValue = cellValue !== "";
    const isValueNumberType = typeof cellValue === "number";
    const parsedValue: number = typeof cellValue === "string" ? parseFloat(cellValue) : cellValue;
    const isValueNumber = !isNaN(parsedValue);
    const hasPrecision = precisions[attrTitle] !== undefined;
    const defaultValue: string | number = cellValue;

    if (isAttrNumberType && cellHasValue && isValueNumber) {
      const cellValAsNumber = Number(cellValue);
      const isWholeNumber: boolean = cellValAsNumber % 1 === 0;
      displayValue = isWholeNumber
        ? parseInt(cellValue as string, 10)
        : parsedValue.toFixed(hasPrecision ? precisions[attrTitle] : 2);
    } else if (!isAttrNumberType && isValueNumberType && cellHasValue) {
      displayValue = (cellValue as number).toFixed(hasPrecision ? precisions[attrTitle] : 2);
    } else {
      displayValue = defaultValue;
    }

    return `${displayValue}`;
  };

export const newAttributeSlug = "newAttr";

export const isNewAttribute = (name: string|number, index: number, attrs: (string|number|IAttribute)[]) => {
  const newAttrRegex = new RegExp(`^${newAttributeSlug}`);
  return !!(String(name).match(newAttrRegex) && index === attrs.length - 1);
};
