import type { Rect } from "@/shared/types";
import type { BoardElement } from "../model/types";

export function getElementBounds(element: BoardElement): Rect {
  const x = Math.min(element.x, element.x + element.width);
  const y = Math.min(element.y, element.y + element.height);

  return {
    x,
    y,
    width: Math.abs(element.width),
    height: Math.abs(element.height),
  };
}
