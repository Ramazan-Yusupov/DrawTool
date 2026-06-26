import { selectionStore } from "@/entities/selection";

export function selectElement(elementId: string, append = false) {
  if (append) {
    selectionStore.toggleElementId(elementId);
    return;
  }

  selectionStore.setElementIds([elementId]);
}
