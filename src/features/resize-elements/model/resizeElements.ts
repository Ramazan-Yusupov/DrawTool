import { updateElement } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { clamp } from "@/shared/lib";
import type { Point } from "@/shared/types";
import { calculateResize } from "../lib/calculateResize";
import type { ResizeHandle } from "./types";

export function resizeElement(
  element: BoardElement,
  handle: ResizeHandle,
  startPoint: Point,
  currentPoint: Point,
) {
  if (element.type === "arrow" && handle === "elbow") {
    const nextOffset =
      element.elbowAxis === "horizontal"
        ? (currentPoint.x - element.x) / (element.width || 1)
        : (currentPoint.y - element.y) / (element.height || 1);

    sceneStore.updateById(element.id, (current) =>
      current.type === "arrow"
        ? updateElement(current, { elbowOffset: clamp(nextOffset, 0.05, 0.95) })
        : current,
    );
    return;
  }

  const patch = calculateResize(element, handle, startPoint, currentPoint);
  sceneStore.updateById(element.id, (current) =>
    updateElement(current, patch),
  );
}
