import type { BoardElement } from "@/entities/element";
import { validateScene } from "./validateScene";

/** Parses a DrawTool JSON scene and applies safe defaults for older scenes. */
export function deserializeScene(source: string): BoardElement[] {
  const parsed: unknown = JSON.parse(source);

  if (!validateScene(parsed)) {
    throw new Error("Файл не похож на сцену DrawTool.");
  }

  return parsed.elements.map((element) => ({
    ...element,
    angle: typeof element.angle === "number" ? element.angle : 0,
    style: { ...element.style },
  }));
}
