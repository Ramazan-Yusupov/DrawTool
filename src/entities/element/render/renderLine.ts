import { getLineDash } from "@/shared/lib/canvas/getLineDash";
import type { LineElement } from "../model/types";

export function renderLine(
  context: CanvasRenderingContext2D,
  element: LineElement,
) {
  const { style } = element;

  context.save();
  context.globalAlpha = style.opacity;
  context.lineCap = "round";
  context.lineWidth = style.strokeWidth;
  context.strokeStyle = style.strokeColor;
  context.setLineDash(getLineDash(style.strokeStyle, style.strokeWidth));

  context.beginPath();
  context.moveTo(element.x, element.y);
  context.lineTo(element.x + element.width, element.y + element.height);
  context.stroke();
  context.restore();
}
