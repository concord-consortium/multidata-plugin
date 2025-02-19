import { CollisionDescriptor, CollisionDetection, pointerWithin } from "@dnd-kit/core";

export const nestedTableCollisionDetection: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // If there are no collisions with the pointer, return the droppable that
  // is closest to the pointer position horizontally.
  return closestHorizontalCenter(args);
};

/**
 * Returns the closest horizontal center to the pointer position or collision rectangle.
 */
export const closestHorizontalCenter: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
  pointerCoordinates
}) => {
  // use pointer coordinates if available; collisionRect seems off in some cases
  const dragX = pointerCoordinates?.x ?? collisionRect.left + collisionRect.width / 2;
  const collisions: CollisionDescriptor[] = [];

  for (const droppableContainer of droppableContainers) {
    const {id} = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const droppableX = rect.left + rect.width / 2;
      const distBetween = Math.abs(dragX - droppableX);

      collisions.push({id, data: {droppableContainer, value: distBetween}});
    }
  }

  return collisions.sort((a, b) => a.data.value - b.data.value);
};
