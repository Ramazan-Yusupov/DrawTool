import { useEffect } from "react";
import { historyStore } from "@/entities/history";
import { attachAllFrameChildren, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import {
  loadSceneFromLocalStorage,
  saveSceneToLocalStorage,
} from "../api/localSceneRepository";

/** Restores the latest automatically saved board once at app startup. */
export function useRestoreScene() {
  useEffect(() => {
    const elements = loadSceneFromLocalStorage();
    if (!elements) return;

    const restored = attachAllFrameChildren(elements);
    sceneStore.setElements(restored);
    selectionStore.clear();
    historyStore.clear();
    saveSceneToLocalStorage(restored);
  }, []);
}
