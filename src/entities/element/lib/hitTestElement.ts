import type { Point } from "@/shared/types";
import { getArrowPathPoints } from "./getArrowPathPoints";
import { getElementBounds } from "./getElementBounds";
import type { BoardElement } from "../model/types";

const HIT_PADDING = 9;

function distanceToSegment(point: Point, start: Point, end: Point) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) /
        lengthSquared,
    ),
  );

  const closestX = start.x + projection * deltaX;
  const closestY = start.y + projection * deltaY;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

function isPointNearPath(point: Point, points: Point[], tolerance: number) {
  return points.some((start, index) => {
    const end = points[index + 1];
    return end ? distanceToSegment(point, start, end) <= tolerance : false;
  });
}

export function hitTestElement(element: BoardElement, point: Point) {
  const tolerance = Math.max(HIT_PADDING, element.style.strokeWidth + 5);

  if (element.type === "line") {
    return (
      distanceToSegment(
        point,
        { x: element.x, y: element.y },
        { x: element.x + element.width, y: element.y + element.height },
      ) <= tolerance
    );
  }

  if (element.type === "arrow") {
    return isPointNearPath(point, getArrowPathPoints(element), tolerance);
  }

  const bounds = getElementBounds(element);

  if (element.type === "ellipse") {
    const radiusX = Math.max(bounds.width / 2, 1);
    const radiusY = Math.max(bounds.height / 2, 1);
    const normalizedX = (point.x - (bounds.x + radiusX)) / radiusX;
    const normalizedY = (point.y - (bounds.y + radiusY)) / radiusY;

    return normalizedX * normalizedX + normalizedY * normalizedY <= 1.18;
  }

  if (element.type === "diamond") {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const normalizedX = Math.abs(point.x - centerX) / Math.max(bounds.width / 2, 1);
    const normalizedY = Math.abs(point.y - centerY) / Math.max(bounds.height / 2, 1);

    return normalizedX + normalizedY <= 1.15;
  }

  return (
    point.x >= bounds.x - tolerance &&
    point.x <= bounds.x + bounds.width + tolerance &&
    point.y >= bounds.y - tolerance &&
    point.y <= bounds.y + bounds.height + tolerance
  );
}
