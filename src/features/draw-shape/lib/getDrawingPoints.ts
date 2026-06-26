import { CANVAS_CONFIG } from "@/shared/config";
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
): DrawingPoints {
  const shouldSnap = isShiftPressed || snapToGrid;

  const adjustedStart = shouldSnap
    ? snapPointToGrid(startPoint, CANVAS_CONFIG.snapSize)
    : startPoint;

  const adjustedEnd = shouldSnap
    ? snapPointToGrid(currentPoint, CANVAS_CONFIG.snapSize)
    : currentPoint;

  if (!isShiftPressed) {
    return {
      startPoint: adjustedStart,
      endPoint: adjustedEnd,
    };
  }

  return {
    startPoint: adjustedStart,
    endPoint: constrainPointToSquare(
      adjustedStart,
      adjustedEnd,
      CANVAS_CONFIG.snapSize,
    ),
  };
}
