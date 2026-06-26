import type { BoardElement } from "@/entities/element";

export type SceneState = {
  elements: BoardElement[];
  version: number;
};
