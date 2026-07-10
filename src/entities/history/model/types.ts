import type { BoardElement } from "@/entities/element";
import type { SceneLayer } from "@/entities/scene";

export type HistorySnapshot = {
  activeLayerId: string;
  elements: BoardElement[];
  layers: SceneLayer[];
};

export type HistoryState = {
  canRedo: boolean;
  canUndo: boolean;
  version: number;
};
