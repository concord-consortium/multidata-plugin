import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { observer } from "mobx-react-lite";
import {Attr} from "./attr";

export const SortableAttr = observer(function SortableAttr({attr}: {attr: any}) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: attr.cid});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Attr attr={attr}/>
    </div>
  );
});
