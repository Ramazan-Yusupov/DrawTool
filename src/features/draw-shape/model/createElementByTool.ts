import { createElement } from "@/entities/element";
import type { BoardElement, ElementStyle } from "@/entities/element";
import type { ShapeToolId } from "@/entities/tool";
import { advancedShapeStore } from "@/features/advanced-shapes";
import type { Point } from "@/shared/types";

type CreateElementByToolParams = {
  startPoint: Point;
  style: ElementStyle;
  toolId: ShapeToolId;
  arrowRouting?: "straight" | "elbow" | "curve";
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
    kind: toolId === "advanced" ? advancedShapeStore.get() : undefined,
    routing: arrowRouting,
  });
}
