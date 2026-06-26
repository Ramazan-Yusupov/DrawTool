import { useEffect } from "react";
import { sceneStore } from "@/entities/scene";
import { saveScene } from "./saveScene";

/** Persists the board shortly after every scene change. */
export function useAutoSave() {
  useEffect(() => {
    let timeoutId: number | undefined;

    const unsubscribe = sceneStore.subscribe(() => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        saveScene();
      }, 180);
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);
}
