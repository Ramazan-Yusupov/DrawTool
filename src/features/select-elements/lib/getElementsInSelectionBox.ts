import { getElementBounds } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import type { Rect } from "@/shared/types";

export function getElementsInSelectionBox(
  elements: BoardElement[],
  selectionBox: Rect,
) {
  return elements.filter((element) => {
    const bounds = getElementBounds(element);

    return (
      bounds.x >= selectionBox.x &&
      bounds.y >= selectionBox.y &&
      bounds.x + bounds.width <= selectionBox.x + selectionBox.width &&
      bounds.y + bounds.height <= selectionBox.y + selectionBox.height
    );
  });
}
