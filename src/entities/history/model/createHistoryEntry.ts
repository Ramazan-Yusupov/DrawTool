import type { BoardElement } from "@/entities/element";
import { getHistorySnapshot } from "../lib/getHistorySnapshot";
import type { HistorySnapshot } from "./types";

/** Creates an immutable scene entry for undo/redo stacks. */
export function createHistoryEntry(elements: BoardElement[]): HistorySnapshot {
  return getHistorySnapshot(elements);
}
