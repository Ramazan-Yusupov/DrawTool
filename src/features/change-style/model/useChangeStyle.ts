import { useCallback } from "react";
import type { ElementStyle } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { changeElementStyle } from "./changeElementStyle";

/** Applies a style patch to the current selection in a single undoable action. */
export function useChangeStyle() {
  return useCallback((patch: Partial<ElementStyle>) => {
    const selectedIds = new Set(selectionStore.get().elementIds);
    if (selectedIds.size === 0) return false;
    historyStore.begin();
    sceneStore.updateAll((element) => selectedIds.has(element.id) ? changeElementStyle(element, patch) : element);
    return historyStore.commit();
  }, []);
}
