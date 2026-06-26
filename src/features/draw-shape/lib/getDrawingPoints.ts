import type { Point } from "@/shared/types";
import { constrainPointToSquare } from "@/shared/lib/math/constrainPointToSquare";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";

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
    endPoint: constrainPointToSquare(adjustedStart, adjustedEnd, snapSize),
  };
}
