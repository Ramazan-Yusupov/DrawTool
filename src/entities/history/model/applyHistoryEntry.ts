import { sceneStore } from "@/entities/scene";
import type { HistorySnapshot } from "./types";

export function applyHistoryEntry(entry: HistorySnapshot) {
  sceneStore.setElements(entry.elements);
}
