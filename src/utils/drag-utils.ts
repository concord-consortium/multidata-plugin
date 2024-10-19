export function getTableContainerCollectionId(id: string) {
  if (id.startsWith("parent:")) {
    return parseInt(id.split(":")[2], 10);
  }
  return NaN;
}
