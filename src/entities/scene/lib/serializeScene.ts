import type { BoardElement } from "@/entities/element";

export type SceneFile = {
  format: "drawtool-scene";
  version: 1;
  savedAt: string;
  elements: BoardElement[];
};

export function serializeScene(elements: BoardElement[]): SceneFile {
  return {
    format: "drawtool-scene",
    version: 1,
    savedAt: new Date().toISOString(),
    elements: JSON.parse(JSON.stringify(elements)) as BoardElement[],
  };
}
