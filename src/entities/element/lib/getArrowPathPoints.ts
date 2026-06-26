import type { Point } from "@/shared/types";
import type { ArrowElement } from "../model/types";

export function getArrowPathPoints(element: ArrowElement): Point[] {
  const start = { x: element.x, y: element.y };
  const end = {
    x: element.x + element.width,
    y: element.y + element.height,
  };

  if (element.routing === "straight") {
    return [start, end];
  }

  if (element.elbowAxis === "horizontal") {
    const bendX = start.x + element.width * element.elbowOffset;

    return [
      start,
      { x: bendX, y: start.y },
      { x: bendX, y: end.y },
      end,
    ];
  }

  const bendY = start.y + element.height * element.elbowOffset;

  return [
    start,
    { x: start.x, y: bendY },
    { x: end.x, y: bendY },
    end,
  ];
}
