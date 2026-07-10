import { createElement } from "@/entities/element";
import type { BoardElement, ElementStyle, TextAlign } from "@/entities/element";
import type { ShapeToolId } from "@/entities/tool";
import { advancedShapeStore } from "@/features/advanced-shapes";
import type { Point } from "@/shared/types";

type CreateElementByToolParams = {
  startPoint: Point;
  style: ElementStyle;
  toolId: ShapeToolId;
  arrowRouting?: "straight" | "elbow" | "curve";
  fontSize?: number;
  fontFamily?: string;
  textAlign?: TextAlign;
};

export function createElementByTool({
  startPoint,
  style,
  toolId,
  arrowRouting,
  fontSize,
  fontFamily,
  textAlign,
}: CreateElementByToolParams): BoardElement {
  return createElement(toolId, {
    x: startPoint.x,
    y: startPoint.y,
    width: 0,
    height: 0,
    style,
    fontSize,
    fontFamily,
    textAlign,
    kind: toolId === "advanced" ? advancedShapeStore.get() : undefined,
    routing: arrowRouting,
  });
}
