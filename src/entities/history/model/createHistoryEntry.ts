import type { SceneState } from "@/entities/scene";
import { getHistorySnapshot } from "../lib/getHistorySnapshot";
import type { HistorySnapshot } from "./types";

/** Creates an immutable scene entry for undo/redo stacks. */
export function createHistoryEntry(scene: SceneState): HistorySnapshot {
  return getHistorySnapshot(scene);
}
