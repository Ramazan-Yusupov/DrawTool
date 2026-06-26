import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";

export function deleteElements(elementIds: string[]) {
  if (elementIds.length === 0) {
    return false;
  }

  historyStore.begin();
  sceneStore.removeMany(elementIds);
  selectionStore.setElementIds(
    selectionStore.get().elementIds.filter((id) => !elementIds.includes(id)),
  );
  historyStore.commit();
  return true;
}

export function deleteSelectedElements() {
  return deleteElements(selectionStore.get().elementIds);
}
