import { useCallback, useMemo, useSyncExternalStore } from "react";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { getLayers } from "./getLayers";

/** Supplies topmost-first layers and selection actions for a future LayersPanel. */
export function useLayersPanel() {
  const scene = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
  const selection = useSyncExternalStore(selectionStore.subscribe, selectionStore.get, selectionStore.get);
  const layers = useMemo(() => getLayers(scene.elements), [scene]);
  const selectLayer = useCallback((id: string) => selectionStore.setElementIds([id]), []);
  return { layers, selectLayer, selectedIds: selection.elementIds };
}
