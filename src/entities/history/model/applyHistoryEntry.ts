import { sceneStore } from "@/entities/scene";
import type { HistorySnapshot } from "./types";

export function applyHistoryEntry(entry: HistorySnapshot) {
  sceneStore.setScene({
    activeLayerId: entry.activeLayerId,
    elements: entry.elements,
    layers: entry.layers,
  });
}
