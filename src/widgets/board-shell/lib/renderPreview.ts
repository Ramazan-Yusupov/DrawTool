import { renderElement } from "@/entities/element";
import type { BoardElement } from "@/entities/element";

/** Draws one element on a dedicated preview canvas at a supplied scale. */
export function renderPreview(context: CanvasRenderingContext2D, element: BoardElement, scale = 1) {
  context.save();
  context.scale(scale, scale);
  context.translate(-element.x, -element.y);
  renderElement(context, element);
  context.restore();
}
