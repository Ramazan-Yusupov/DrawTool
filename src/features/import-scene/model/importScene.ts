import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import type { BoardElement } from "@/entities/element";

/** Replaces the active canvas with a validated scene and resets transient UI state. */
export function importScene(elements: BoardElement[]) {
  historyStore.begin();
  sceneStore.setElements(elements);
  selectionStore.clear();
  historyStore.commit();
}
