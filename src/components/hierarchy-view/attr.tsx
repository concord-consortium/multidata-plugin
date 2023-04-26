import React from "react";
import css from "./attr.scss";

export const Attr = ({attr}: {attr: any}) => {
  return (
    <div className={css.attr}>
      {attr.name}
    </div>
  );
};
