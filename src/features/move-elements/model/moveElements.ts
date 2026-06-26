import { updateElement } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import type { Point } from "@/shared/types";

export function moveElements(elementIds: string[], delta: Point) {
  const selectedIds = new Set(elementIds);

  sceneStore.updateAll((element: BoardElement) =>
    selectedIds.has(element.id)
      ? updateElement(element, {
          x: element.x + delta.x,
          y: element.y + delta.y,
        })
      : element,
  );
}
