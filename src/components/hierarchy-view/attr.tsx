import React from "react";
import { observer } from "mobx-react-lite";
import css from "./attr.scss";

export const Attr = observer(function Attr({attr}: {attr: any}) {
  return (
    <div className={css.attr}>
      {attr.name}
    </div>
  );
});
