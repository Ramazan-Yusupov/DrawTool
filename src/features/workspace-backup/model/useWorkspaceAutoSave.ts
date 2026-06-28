import { useEffect } from "react";
import { toolStore } from "@/entities/tool";
import { viewportStore } from "@/entities/viewport";
import { stickerSettingsStore } from "@/features/add-sticker";
import { toolSettingsStore } from "@/features/change-style";
import { projectStore } from "@/features/projects";
import { themeStore } from "@/features/toggle-theme";
import { debounce } from "@/shared/lib";
import { sceneStore } from "@/entities/scene";
import { workspacePersistenceStore } from "./workspacePersistenceStore";

/** Keeps browser projects and an optional connected backup folder in sync. */
export function useWorkspaceAutoSave() {
  useEffect(() => {
    void workspacePersistenceStore.initialize();

    const persist = debounce(() => {
      void workspacePersistenceStore.saveNow();
    }, 650);

    const unsubscribers = [
      sceneStore.subscribe(persist),
      viewportStore.subscribe(persist),
      projectStore.subscribe(persist),
      themeStore.subscribe(persist),
      toolStore.subscribe(persist),
      toolSettingsStore.subscribe(persist),
      stickerSettingsStore.subscribe(persist),
    ];

    function flush() {
      persist.flush();
    }

    window.addEventListener("pagehide", flush);

    return () => {
      persist.flush();
      window.removeEventListener("pagehide", flush);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}
