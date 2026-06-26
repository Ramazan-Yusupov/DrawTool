import { createElement } from "@/entities/element";
import type { BoardElement, ElementStyle } from "@/entities/element";
import type { ShapeToolId } from "@/entities/tool";
import type { Point } from "@/shared/types";

type CreateElementByToolParams = {
  startPoint: Point;
  style: ElementStyle;
  toolId: ShapeToolId;
  arrowRouting?: "straight" | "elbow";
};

export function createElementByTool({
  startPoint,
  style,
  toolId,
  arrowRouting,
}: CreateElementByToolParams): BoardElement {
  return createElement(toolId, {
    x: startPoint.x,
    y: startPoint.y,
    width: 0,
    height: 0,
    style,
    routing: arrowRouting,
  });
}
