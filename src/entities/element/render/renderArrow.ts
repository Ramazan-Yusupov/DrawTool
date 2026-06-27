import { getLineDash } from "@/shared/lib/canvas/getLineDash";
import {
  getArrowCurveControlPoint,
  getArrowPathPoints,
} from "../lib/getArrowPathPoints";
import type { ArrowElement } from "../model/types";

const ARROW_HEAD_LENGTH = 12;
const ARROW_HEAD_ANGLE = Math.PI / 7;

function getArrowHeadAngle(element: ArrowElement) {
  const end = {
    x: element.x + element.width,
    y: element.y + element.height,
  };

  if (element.routing === "curve") {
    const control = getArrowCurveControlPoint(element);
    return Math.atan2(end.y - control.y, end.x - control.x);
  }

  const points = getArrowPathPoints(element);
  const previousPoint = points.at(-2);

  return previousPoint
    ? Math.atan2(end.y - previousPoint.y, end.x - previousPoint.x)
    : 0;
}

export function renderArrow(
  context: CanvasRenderingContext2D,
  element: ArrowElement,
) {
  const { style } = element;
  const start = { x: element.x, y: element.y };
  const end = {
    x: element.x + element.width,
    y: element.y + element.height,
  };
  const points = getArrowPathPoints(element);

  if (points.length < 2) {
    return;
  }

  const angle = getArrowHeadAngle(element);

  context.save();
  context.globalAlpha = style.opacity;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = style.strokeWidth;
  context.strokeStyle = style.strokeColor;
  context.setLineDash(getLineDash(style.strokeStyle, style.strokeWidth));

  context.beginPath();
  context.moveTo(start.x, start.y);

  if (element.routing === "curve") {
    const control = getArrowCurveControlPoint(element);
    context.quadraticCurveTo(control.x, control.y, end.x, end.y);
  } else {
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  }

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
