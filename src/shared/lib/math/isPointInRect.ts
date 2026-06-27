import type { Point, Rect } from "@/shared/types";

/** Checks whether a point is inside an axis-aligned rectangle, including edges. */
export function isPointInRect(point: Point, rect: Rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
