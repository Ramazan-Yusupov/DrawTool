import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getSceneElementCount, sceneStore } from "@/entities/scene";
import { isElementSelected, selectionStore } from "@/entities/selection";
import { getLayers } from "./getLayers";

/** Supplies topmost-first layers and selection actions for the layers panel. */
export function useLayersPanel() {
  const scene = useSyncExternalStore(
    sceneStore.subscribe,
    sceneStore.get,
    sceneStore.get,
  );
  const selection = useSyncExternalStore(
    selectionStore.subscribe,
    selectionStore.get,
    selectionStore.get,
  );
  const layers = useMemo(() => getLayers(scene.elements), [scene]);
  const selectLayer = useCallback(
    (id: string) => selectionStore.setElementIds([id]),
    [],
  );
  const isSelected = useCallback(
    (id: string) => isElementSelected(selection, id),
    [selection],
  );

  return {
    count: getSceneElementCount(scene),
    isSelected,
    layers,
    selectLayer,
  };
}
