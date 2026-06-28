import { useEffect } from "react";
import { useAutoSave, useRestoreScene } from "@/features/save-scene";
import { useWorkspaceAutoSave } from "@/features/workspace-backup";
import { preventBrowserZoom } from "@/shared/lib";
import { useBoardShortcuts } from "./useBoardShortcuts";

export function useBoardLifecycle() {
  useRestoreScene();
  useAutoSave();
  useWorkspaceAutoSave();
  useBoardShortcuts();

  useEffect(() => preventBrowserZoom(), []);
}
