import { getLineDash } from "@/shared/lib/canvas/getLineDash";
import type { ArrowElement } from "../model/types";

const ARROW_HEAD_LENGTH = 12;
const ARROW_HEAD_ANGLE = Math.PI / 7;

export function renderArrow(
  context: CanvasRenderingContext2D,
  element: ArrowElement,
) {
  const { style } = element;
  const startX = element.x;
  const startY = element.y;
  const endX = element.x + element.width;
  const endY = element.y + element.height;
  const angle = Math.atan2(endY - startY, endX - startX);

  context.save();
  context.globalAlpha = style.opacity;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = style.strokeWidth;
  context.strokeStyle = style.strokeColor;
  context.setLineDash(getLineDash(style.strokeStyle, style.strokeWidth));

  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(endX, endY);
  context.stroke();

  if (startX !== endX || startY !== endY) {
    context.setLineDash([]);
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(
      endX - ARROW_HEAD_LENGTH * Math.cos(angle - ARROW_HEAD_ANGLE),
      endY - ARROW_HEAD_LENGTH * Math.sin(angle - ARROW_HEAD_ANGLE),
    );
    context.moveTo(endX, endY);
    context.lineTo(
      endX - ARROW_HEAD_LENGTH * Math.cos(angle + ARROW_HEAD_ANGLE),
      endY - ARROW_HEAD_LENGTH * Math.sin(angle + ARROW_HEAD_ANGLE),
    );
    context.stroke();
  }

  context.restore();
}
