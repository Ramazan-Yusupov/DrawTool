import { useEffect } from "react";
import { useAutoSave, useRestoreScene } from "@/features/save-scene";
import { preventBrowserZoom } from "@/shared/lib";
import { useBoardShortcuts } from "./useBoardShortcuts";

export function useBoardLifecycle() {
  useRestoreScene();
  useAutoSave();
  useBoardShortcuts();

  useEffect(() => preventBrowserZoom(), []);
}
