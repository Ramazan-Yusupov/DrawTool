import { useRef } from "react";
import type { Point } from "@/shared/types";
import { moveElements } from "./moveElements";

type MoveState = {
  elementIds: string[];
  previousPoint: Point;
};

export function useMoveElements() {
  const moveRef = useRef<MoveState | null>(null);

  function startMove(elementIds: string[], startPoint: Point) {
    moveRef.current = { elementIds, previousPoint: startPoint };
  }

  function updateMove(point: Point) {
    const moveState = moveRef.current;
    if (!moveState) {
      return false;
    }

    moveElements(moveState.elementIds, {
      x: point.x - moveState.previousPoint.x,
      y: point.y - moveState.previousPoint.y,
    });
    moveState.previousPoint = point;
    return true;
  }

  function finishMove() {
    const hadMove = moveRef.current !== null;
    moveRef.current = null;
    return hadMove;
  }

  return { finishMove, startMove, updateMove };
}
