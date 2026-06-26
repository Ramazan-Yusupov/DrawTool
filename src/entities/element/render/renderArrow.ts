import { getLineDash } from "@/shared/lib/canvas/getLineDash";
import { getArrowPathPoints } from "../lib/getArrowPathPoints";
import type { ArrowElement } from "../model/types";

const ARROW_HEAD_LENGTH = 12;
const ARROW_HEAD_ANGLE = Math.PI / 7;

export function renderArrow(
  context: CanvasRenderingContext2D,
  element: ArrowElement,
) {
  const { style } = element;
  const points = getArrowPathPoints(element);
  const end = points.at(-1);
  const previousPoint = points.at(-2);

  if (!end || !previousPoint) {
    return;
  }

  const angle = Math.atan2(end.y - previousPoint.y, end.x - previousPoint.x);

  context.save();
  context.globalAlpha = style.opacity;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = style.strokeWidth;
  context.strokeStyle = style.strokeColor;
  context.setLineDash(getLineDash(style.strokeStyle, style.strokeWidth));

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();

  context.setLineDash([]);
  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - ARROW_HEAD_LENGTH * Math.cos(angle - ARROW_HEAD_ANGLE),
    end.y - ARROW_HEAD_LENGTH * Math.sin(angle - ARROW_HEAD_ANGLE),
  );
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - ARROW_HEAD_LENGTH * Math.cos(angle + ARROW_HEAD_ANGLE),
    end.y - ARROW_HEAD_LENGTH * Math.sin(angle + ARROW_HEAD_ANGLE),
  );
  context.stroke();
  context.restore();
}
