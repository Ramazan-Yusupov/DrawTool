import type { BoardElement } from "@/entities/element";
import type { SceneFile } from "./serializeScene";

function isBoardElement(value: unknown): value is BoardElement {
  if (!value || typeof value !== "object") return false;
  const element = value as Partial<BoardElement>;

  return (
    typeof element.id === "string" &&
    typeof element.type === "string" &&
    typeof element.x === "number" &&
    typeof element.y === "number" &&
    typeof element.width === "number" &&
    typeof element.height === "number" &&
    typeof element.style === "object"
  );
}

export function validateScene(value: unknown): value is SceneFile {
  if (!value || typeof value !== "object") return false;
  const scene = value as Partial<SceneFile>;

  return (
    scene.format === "drawtool-scene" &&
    scene.version === 1 &&
    Array.isArray(scene.elements) &&
    scene.elements.every(isBoardElement)
  );
}
