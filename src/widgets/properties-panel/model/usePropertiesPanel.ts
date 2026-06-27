import { useSyncExternalStore } from "react";
import { sceneStore } from "@/entities/scene";
import { getSelectedElements, selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";

/** Shared selection/tool data used by future split properties-panel sections. */
export function usePropertiesPanel() {
  const activeTool = useSyncExternalStore(toolStore.subscribe, toolStore.get, toolStore.get);
  const scene = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
  const selection = useSyncExternalStore(selectionStore.subscribe, selectionStore.get, selectionStore.get);
  const selectedElements = getSelectedElements(scene.elements, selection);
  const primaryElement = selectedElements.length === 1 ? selectedElements[0] : null;

  return { activeTool, primaryElement, scene, selectedElements, selection };
}
