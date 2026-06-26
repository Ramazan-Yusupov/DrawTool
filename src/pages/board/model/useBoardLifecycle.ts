import { useAutoSave, useRestoreScene } from "@/features/save-scene";
import { useBoardShortcuts } from "./useBoardShortcuts";

export function useBoardLifecycle() {
  useRestoreScene();
  useAutoSave();
  useBoardShortcuts();
}
