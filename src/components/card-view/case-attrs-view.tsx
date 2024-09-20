import React from "react";
import { observer } from "mobx-react-lite";
import { IProcessedCaseObj } from "../../types";
import { CaseAttrView } from "./case-attr-view";

import css from "./card-view.scss";

interface ICaseAttrsViewProps {
  caseItem: IProcessedCaseObj;
  attrs: Record<string, any>;
}

export const CaseAttrsView = observer(function CaseAttrsView({caseItem: {values}, attrs}: ICaseAttrsViewProps) {
  const keys = [...values.keys()];

  return (
    <table className={`${css.caseAttrs} ${css.fadeIn}`}>
      <tbody>
        {keys.map(key => <CaseAttrView key={key} name={String(key)} value={values.get(key)} attr={attrs[key]} />)}
      </tbody>
    </table>
  );
});
