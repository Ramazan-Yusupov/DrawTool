import type { BoardElement } from "@/entities/element";

export type HistorySnapshot = {
  elements: BoardElement[];
};

export type HistoryState = {
  canRedo: boolean;
  canUndo: boolean;
  version: number;
};
