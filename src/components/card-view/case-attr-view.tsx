import React from "react";

import css from "./card-view.scss";

interface ICaseAttrViewProps {
  name: string;
  value: string|number;
  attr: any;
}

export const CaseAttrView = ({name, value, attr}: ICaseAttrViewProps) => {
  const unit = attr.unit ? ` (${attr.unit})` : "";

  return (
    <tr className={css.attr}>
      <td className={css.name}>{name}{unit}</td>
      <td className={css.value}>{value}</td>
    </tr>
  );
};
