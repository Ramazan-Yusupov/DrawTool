import type { Point } from "@/shared/types";
import { constrainPointToAngle } from "@/shared/lib/math/constrainPointToAngle";
import { constrainPointToSquare } from "@/shared/lib/math/constrainPointToSquare";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";

export type DrawingConstraint = "square" | "angle";

type DrawingPoints = {
  startPoint: Point;
  endPoint: Point;
};

export function getDrawingPoints(
  startPoint: Point,
  currentPoint: Point,
  isShiftPressed: boolean,
  snapToGrid: boolean,
  snapSize: number,
  constraint: DrawingConstraint,
): DrawingPoints {
  const shouldSnap = isShiftPressed || snapToGrid;

  const adjustedStart = shouldSnap
    ? snapPointToGrid(startPoint, snapSize)
    : startPoint;

  const adjustedEnd = shouldSnap
    ? snapPointToGrid(currentPoint, snapSize)
    : currentPoint;

  if (!isShiftPressed) {
    return {
      startPoint: adjustedStart,
      endPoint: adjustedEnd,
    };
  }

  return {
    startPoint: adjustedStart,
    endPoint:
      constraint === "angle"
        ? constrainPointToAngle(adjustedStart, adjustedEnd)
        : constrainPointToSquare(adjustedStart, adjustedEnd, snapSize),
  };
}
