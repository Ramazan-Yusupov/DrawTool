import { updateElement } from "@/entities/element";
import type { BoardElement, ElementStyle } from "@/entities/element";

/** Returns an updated element without mutating its style object. */
export function changeElementStyle(
  element: BoardElement,
  patch: Partial<ElementStyle>,
) {
  return updateElement(element, { style: { ...element.style, ...patch } });
}
