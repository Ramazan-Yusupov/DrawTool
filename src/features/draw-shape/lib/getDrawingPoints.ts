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
): DrawingPoints {
  if (!isShiftPressed) {
    return {
      startPoint,
      endPoint: currentPoint,
    };
  }

  const snappedStart = snapPointToGrid(startPoint, CANVAS_CONFIG.snapSize);

  const snappedCurrent = snapPointToGrid(currentPoint, CANVAS_CONFIG.snapSize);

  return {
    startPoint: snappedStart,
    endPoint: constrainPointToSquare(
      snappedStart,
      snappedCurrent,
      CANVAS_CONFIG.snapSize,
    ),
  };
}
