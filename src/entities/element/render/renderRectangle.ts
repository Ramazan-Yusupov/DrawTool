import type { RectangleElement } from "../model/types";

export function renderRectangle(
  context: CanvasRenderingContext2D,
  element: RectangleElement,
) {
  context.save();

  context.globalAlpha = element.style.opacity;
  context.lineWidth = element.style.strokeWidth;
  context.strokeStyle = element.style.strokeColor;

  if (element.style.backgroundColor !== "transparent") {
    context.fillStyle = element.style.backgroundColor;

    context.fillRect(element.x, element.y, element.width, element.height);
  }

  context.strokeRect(element.x, element.y, element.width, element.height);

  context.restore();
}
