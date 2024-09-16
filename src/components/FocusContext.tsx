import React, { createContext, useContext, useRef, useState } from "react";

type FocusedCellInfo = {
  caseId: string;
  attrTitle: string;
};

interface FocusContextValue {
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  focusedCell: FocusedCellInfo|null;
  setFocusedCell: (cellInfo: FocusedCellInfo) => void;
}

const defaultContextValue: FocusContextValue = {
  inputRefs: { current: {} },
  focusedCell: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setFocusedCell: (cellInfo: FocusedCellInfo) => {},
};

// Create a context for managing focus
const FocusContext = createContext(defaultContextValue);

export const useFocusContext = () => {
  return useContext(FocusContext);
};

export const FocusProvider = ({children}: {children: React.ReactNode}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusedCell, setFocusedCell] = useState<FocusedCellInfo | null>(null);

  return (
    <FocusContext.Provider value={{ inputRefs, focusedCell, setFocusedCell }}>
      {children}
    </FocusContext.Provider>
  );
};
