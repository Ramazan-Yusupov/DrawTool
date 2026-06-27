import { updateElement } from "@/entities/element";
import type { ElementStyle } from "@/entities/element";
import type { ShapeToolId } from "@/entities/tool";
import type { Point } from "@/shared/types";
import { createElementByTool } from "../model/createElementByTool";

/** Creates a temporary element model used by hover/drag preview renderers. */
export function getShapePreview(
  toolId: ShapeToolId,
  startPoint: Point,
  endPoint: Point,
  style: ElementStyle,
) {
  const preview = createElementByTool({ startPoint, style, toolId });

  return updateElement(preview, {
    width: endPoint.x - startPoint.x,
    height: endPoint.y - startPoint.y,
  });
}
