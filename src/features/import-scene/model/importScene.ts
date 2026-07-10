import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import type { SceneState } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import type { BoardElement } from "@/entities/element";

/** Replaces the active canvas with a validated scene and resets transient UI state. */
export function importScene(sceneOrElements: BoardElement[] | Omit<SceneState, "version">) {
  historyStore.begin();
  if (Array.isArray(sceneOrElements)) {
    sceneStore.setElements(sceneOrElements);
  } else {
    sceneStore.setScene(sceneOrElements);
  }
  selectionStore.clear();
  historyStore.commit();
}
