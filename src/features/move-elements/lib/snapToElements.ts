import { getElementBounds } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import type { Point } from "@/shared/types";

/** Finds a small x/y translation that aligns a moving bounds edge to another element. */
export function snapToElements(moving: BoardElement, candidates: BoardElement[], threshold = 6): Point {
  const bounds = getElementBounds(moving);
  let deltaX = 0;
  let deltaY = 0;
  for (const candidate of candidates) {
    if (candidate.id === moving.id) continue;
    const target = getElementBounds(candidate);
    const xPairs = [[bounds.x, target.x], [bounds.x + bounds.width, target.x + target.width], [bounds.x + bounds.width / 2, target.x + target.width / 2]] as const;
    const yPairs = [[bounds.y, target.y], [bounds.y + bounds.height, target.y + target.height], [bounds.y + bounds.height / 2, target.y + target.height / 2]] as const;
    for (const [from, to] of xPairs) if (Math.abs(to - from) <= threshold) deltaX = to - from;
    for (const [from, to] of yPairs) if (Math.abs(to - from) <= threshold) deltaY = to - from;
  }
  return { x: deltaX, y: deltaY };
}
