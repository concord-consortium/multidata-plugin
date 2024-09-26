import { createContext, useContext } from "react";

interface ITableHeaderFocusContext {
  focusSetForLevels: Map<number, boolean>;
  updateFocusSetForLevel: (level: number) => void
}

export const TableHeaderFocusContext = createContext<ITableHeaderFocusContext>({
  focusSetForLevels: new Map<number, boolean>(),
  updateFocusSetForLevel: (level: number) => {
    throw new Error("Focus context not initialized");
  }
});

export const useTableHeaderFocusContext = () => useContext(TableHeaderFocusContext);
