import type { BoardElement } from "@/entities/element";
import type { HistorySnapshot } from "../model/types";

/** Creates an immutable copy that can safely be placed in undo/redo history. */
export function getHistorySnapshot(elements: BoardElement[]): HistorySnapshot {
  return {
    elements: JSON.parse(JSON.stringify(elements)) as BoardElement[],
  };
}
