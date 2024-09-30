import { IAttribute } from "../types";

export const getDisplayValue = (cellValue: string | number, attrTitle: string,
  attrTypes: Record<string, string | undefined | null>, precisions: Record<string, number>) => {
    let displayValue: string|number;
    const isNumericType = attrTypes[attrTitle] === "numeric";
    const hasValue = cellValue !== "";
    const parsedValue: number = typeof cellValue === "string" ? parseFloat(cellValue) : NaN;
    const isNumber = !isNaN(parsedValue);
    const hasPrecision = precisions[attrTitle] !== undefined;
    const defaultValue: string | number = cellValue;
    const isNumberType = typeof cellValue === "number";

    if (isNumericType && hasValue && isNumber) {
      const cellValAsNumber = Number(cellValue);
      const isWholeNumber: boolean = cellValAsNumber % 1 === 0;
      displayValue = isWholeNumber
        ? parseInt(cellValue as string, 10)
        : parsedValue.toFixed(hasPrecision ? precisions[attrTitle] : 2);
    } else if (!isNumericType && isNumberType && hasValue) {
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
