import { useEffect } from "react";
import { sceneStore } from "@/entities/scene";
import { saveScene } from "./saveScene";

/** Persists the active IndexedDB project shortly after every scene change. */
export function useAutoSave() {
  useEffect(() => {
    let timeoutId: number | undefined;

    const unsubscribe = sceneStore.subscribe(() => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void saveScene();
      }, 240);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);
}
