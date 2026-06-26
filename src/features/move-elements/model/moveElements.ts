import { updateElement } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import type { Point } from "@/shared/types";

export function moveElements(elementIds: string[], delta: Point) {
  const selectedIds = new Set(elementIds);

  sceneStore.updateAll((element: BoardElement) => {
    if (!selectedIds.has(element.id)) {
      return element;
    }

    if (element.type === "freedraw") {
      return updateElement(element, {
        x: element.x + delta.x,
        y: element.y + delta.y,
        points: element.points.map((point) => ({
          x: point.x + delta.x,
          y: point.y + delta.y,
        })),
      });
    }

    return updateElement(element, {
      x: element.x + delta.x,
      y: element.y + delta.y,
    });
  });
}
