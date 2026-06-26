import type { BoardElement } from "../model/types";

/** Rotation is stored in radians and intentionally is not normalized. */
export function getElementRotation(element: BoardElement) {
  return element.angle ?? 0;
}
