import { canUseElementLabel, type BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";

export function getSelectedElements() {
  const selectedIds = new Set(selectionStore.get().elementIds);
  return sceneStore
    .get()
    .elements.filter((element) => selectedIds.has(element.id));
}

export function getElementsByIds(elementIds: string[]) {
  const ids = new Set(elementIds);
  return sceneStore.get().elements.filter((element) => ids.has(element.id));
}

export function canUseLabel(element: BoardElement) {
  return canUseElementLabel(element);
}
