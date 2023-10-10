import React from "react";
import { IProcessedCaseObj } from "../../types";
import { CaseAttrView } from "./case-attr-view";

import css from "./card-view.scss";

interface ICaseAttrsViewProps {
  caseItem: IProcessedCaseObj;
  attrs: Record<string, any>;
}

export const CaseAttrsView = ({caseItem: {values}, attrs}: ICaseAttrsViewProps) => {
  const keys = Object.keys(values);

  return (
    <table className={`${css.caseAttrs} ${css.fadeIn}`}>
      <tbody>
        {keys.map(key => <CaseAttrView key={key} name={key} value={values[key]} attr={attrs[key]} />)}
      </tbody>
    </table>
  );
};
