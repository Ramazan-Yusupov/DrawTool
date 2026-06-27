import type { ArrowRouting, ElementStyle } from "@/entities/element";
import type { ShapeToolId } from "@/entities/tool";
import type { Point } from "@/shared/types";
import { drawShape } from "../model/drawShape";
import { createElementByTool } from "../model/createElementByTool";

/** Creates a temporary element model for the active drawing gesture. */
export function getShapePreview(
  toolId: ShapeToolId,
  startPoint: Point,
  endPoint: Point,
  style: ElementStyle,
  arrowRouting?: ArrowRouting,
) {
  const preview = createElementByTool({
    arrowRouting,
    startPoint,
    style,
    toolId,
  });

  return drawShape(preview, startPoint, endPoint);
}
