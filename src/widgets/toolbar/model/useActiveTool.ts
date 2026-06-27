import { useSyncExternalStore } from "react";
import { toolStore } from "@/entities/tool";

/** Subscribes UI controls to the currently active board tool. */
export function useActiveTool() {
  return useSyncExternalStore(toolStore.subscribe, toolStore.get, toolStore.get);
}
