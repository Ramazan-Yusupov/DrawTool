import { historyStore } from "@/entities/history";
import { selectionStore } from "@/entities/selection";
import { sceneStore } from "./sceneStore";

/** Clears the canvas together with selection and undo/redo state. */
export function resetScene() {
  sceneStore.clear();
  selectionStore.clear();
  historyStore.clear();
}
