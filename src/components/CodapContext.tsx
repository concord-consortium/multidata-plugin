import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { CodapState } from "../types";
import { useCodapState } from "../hooks/useCodapState";

const CodapContext = createContext({} as CodapState);

export const useCodapContext = () => {
  return useContext(CodapContext);
};

export const CodapProvider = ({ children }: { children: ReactNode }) => {
  const codapState = useCodapState();

  useEffect(() => {
    codapState.init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!codapState.connected) {
    return <div>Loading...</div>;
  }

  return (
    <CodapContext.Provider value={codapState}>
      {children}
    </CodapContext.Provider>
  );
};
