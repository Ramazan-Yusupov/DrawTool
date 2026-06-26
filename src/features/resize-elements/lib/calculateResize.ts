import type { BoardElement } from "@/entities/element";
import type { Point } from "@/shared/types";
import type { ResizeHandle } from "../model/types";

const MIN_SIZE = 8;

export function calculateResize(
  element: BoardElement,
  handle: ResizeHandle,
  startPoint: Point,
  currentPoint: Point,
) {
  const deltaX = currentPoint.x - startPoint.x;
  const deltaY = currentPoint.y - startPoint.y;

  if (element.type === "line" || element.type === "arrow") {
    if (handle === "start") {
      return {
        x: element.x + deltaX,
        y: element.y + deltaY,
        width: element.width - deltaX,
        height: element.height - deltaY,
      };
    }

    if (handle === "end") {
      return { width: element.width + deltaX, height: element.height + deltaY };
    }

    return {};
  }

  let x = element.x;
  let y = element.y;
  let width = element.width;
  let height = element.height;

  if (handle.includes("e")) {
    width = Math.max(MIN_SIZE, element.width + deltaX);
  }

  if (handle.includes("s")) {
    height = Math.max(MIN_SIZE, element.height + deltaY);
  }

  if (handle.includes("w")) {
    const nextWidth = Math.max(MIN_SIZE, element.width - deltaX);
    x = element.x + (element.width - nextWidth);
    width = nextWidth;
  }

  if (handle.includes("n")) {
    const nextHeight = Math.max(MIN_SIZE, element.height - deltaY);
    y = element.y + (element.height - nextHeight);
    height = nextHeight;
  }

  return { x, y, width, height };
}
