import type { BoardElement } from "@/entities/element";
import { updateElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { styleClipboardStore } from "./styleClipboardStore";

export function copyElementStyle(element: BoardElement) {
  styleClipboardStore.set(element.style);
}

export function applyCopiedStyleToSelectedElements() {
  const style = styleClipboardStore.get().style;
  const ids = new Set(selectionStore.get().elementIds);
  if (!style || ids.size === 0) return false;

  historyStore.begin();
  sceneStore.updateAll((element) => ids.has(element.id) ? updateElement(element, { style: { ...style } }) : element);
  return historyStore.commit();
}
