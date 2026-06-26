import type { BoardElement } from "@/entities/element";
import type { HistorySnapshot } from "./types";

export function createHistoryEntry(elements: BoardElement[]): HistorySnapshot {
  return {
    elements: JSON.parse(JSON.stringify(elements)) as BoardElement[],
  };
}
