import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IProcessedCaseObj } from "../../types";
import { CaseAttrsView } from "./case-attrs-view";
import Arrow from "../../assets/arrow.svg";

import css from "./card-view.scss";

const backgroundColors = [
  "#CEE9FB",
  "#F7EABA",
  "#CCBEE0",
  "#BEE0CA",
  "#E7C3A4"
];
const getBackgroundColor = (level: number) => backgroundColors[level % backgroundColors.length];

interface ICaseViewProps {
  cases: IProcessedCaseObj[];
  attrs: Record<string,any>;
  level: number;
  selectCases: (caseIds: number[]) => Promise<void>
  codapSelectedCaseLineage: number[];
}

export const CaseView = (props: ICaseViewProps) => {
  const {cases, attrs, level, selectCases, codapSelectedCaseLineage} = props;

  // default to the first case
  const [selectedCase, setSelectedCase] = useState<IProcessedCaseObj>(cases[0]);

  // update the selected case if the user selects a case outside of the plugin
  useEffect(() => {
    const selectedCodapCaseId = codapSelectedCaseLineage[level];
    if (selectedCodapCaseId) {
      const selectedCodapCase = cases.find(c => c.id === selectedCodapCaseId);
      if (selectedCodapCase) {
        setSelectedCase(selectedCodapCase);
      }
    }
  }, [codapSelectedCaseLineage, level, cases]);

  const selectedCaseIndex = useMemo(() => {
    // the first time this runs selectedCase will not be defined and this will return -1, thus the Math.max
    return Math.max(0, cases.indexOf(selectedCase));
  }, [selectedCase, cases]);

  const prevButtonDisabled = selectedCaseIndex <= 0;
  const nextButtonDisabled = selectedCaseIndex >= cases.length - 1;

  const style: React.CSSProperties = {backgroundColor: getBackgroundColor(level)};

  const handleButtonClickFn = useCallback((delta: number) => () => {
    const newCase = cases[selectedCaseIndex + delta];
    selectCases([newCase.id]);
    setSelectedCase(newCase);
  }, [selectedCaseIndex, cases, setSelectedCase, selectCases]);

  return (
    <div className={`${css.case} ${css.fadeIn}`} style={style}>
      <div className={css.title}>
        {selectedCase.collection.name}
        <div className={css.controls}>
          <button className={css.arrow} disabled={prevButtonDisabled} onClick={handleButtonClickFn(-1)}>
            <Arrow style={{rotate: "90deg"}} />
          </button>
          <span className={css.caseIndex}>{selectedCaseIndex + 1} of {cases.length}</span>
          <button className={css.arrow} disabled={nextButtonDisabled} onClick={handleButtonClickFn(+1)}>
            <Arrow style={{rotate: "-90deg"}} />
          </button>
        </div>
      </div>

      <CaseAttrsView key={selectedCase.id} caseItem={selectedCase} attrs={attrs} />

      {selectedCase.children.length > 0 &&
        <CaseView
          key={`${selectedCase.id}-${level}`}
          cases={selectedCase.children}
          attrs={attrs}
          level={level + 1}
          selectCases={selectCases}
          codapSelectedCaseLineage={codapSelectedCaseLineage}
        />
      }
    </div>
  );
};
