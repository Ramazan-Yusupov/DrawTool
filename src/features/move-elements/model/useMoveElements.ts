import { useRef } from "react";
import { getSelectionBounds } from "@/entities/selection";
import { sceneStore } from "@/entities/scene";
import type { BoardElement } from "@/entities/element";
import { getAlignmentSnap } from "../lib/getAlignmentSnap";
import { alignmentGuidesStore } from "./alignmentGuidesStore";
import { moveElementByDelta } from "./moveElements";
import type { Point, Rect } from "@/shared/types";

type MoveAxis = "x" | "y";

type MoveOptions = {
  alignToElements: boolean;
  constrainToAxis: boolean;
  zoom: number;
};

type MoveState = {
  elementIds: string[];
  initialBounds: Rect | null;
  initialElements: Map<string, BoardElement>;
  lockedAxis: MoveAxis | null;
  startPoint: Point;
};

function getInitialElements(elementIds: string[]) {
  const selectedIds = new Set(elementIds);

  return new Map(
    sceneStore
      .get()
      .elements.filter((element) => selectedIds.has(element.id))
      .map((element) => [element.id, element] as const),
  );
}

export function useMoveElements() {
  const moveRef = useRef<MoveState | null>(null);

  function startMove(elementIds: string[], startPoint: Point) {
    const initialElements = getInitialElements(elementIds);

    moveRef.current = {
      elementIds,
      initialBounds: getSelectionBounds([...initialElements.values()]),
      initialElements,
      lockedAxis: null,
      startPoint,
    };

    alignmentGuidesStore.clear();
  }

  function getConstrainedDelta(
    moveState: MoveState,
    point: Point,
    constrainToAxis: boolean,
  ) {
    let deltaX = point.x - moveState.startPoint.x;
    let deltaY = point.y - moveState.startPoint.y;

    if (!constrainToAxis) {
      moveState.lockedAxis = null;
      return { deltaX, deltaY };
    }

    if (!moveState.lockedAxis && (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)) {
      moveState.lockedAxis =
        Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
    }

    if (moveState.lockedAxis === "x") {
      deltaY = 0;
    }

    if (moveState.lockedAxis === "y") {
      deltaX = 0;
    }

    return { deltaX, deltaY };
  }

  function updateMove(point: Point, options: MoveOptions) {
    const moveState = moveRef.current;

    if (!moveState) {
      return false;
    }

    const constrainedDelta = getConstrainedDelta(
      moveState,
      point,
      options.constrainToAxis,
    );
    let deltaX = constrainedDelta.deltaX;
    let deltaY = constrainedDelta.deltaY;

    if (options.alignToElements && moveState.initialBounds) {
      const movingBounds: Rect = {
        x: moveState.initialBounds.x + deltaX,
        y: moveState.initialBounds.y + deltaY,
        width: moveState.initialBounds.width,
        height: moveState.initialBounds.height,
      };
      const selectedIds = new Set(moveState.elementIds);
      const snapResult = getAlignmentSnap({
        allowHorizontal: moveState.lockedAxis !== "y",
        allowVertical: moveState.lockedAxis !== "x",
        movingBounds,
        staticElements: sceneStore
          .get()
          .elements.filter((element) => !selectedIds.has(element.id)),
        threshold: 8 / options.zoom,
      });

      deltaX += snapResult.deltaX;
      deltaY += snapResult.deltaY;
      alignmentGuidesStore.set(snapResult.guides);
    } else {
      alignmentGuidesStore.clear();
    }

    sceneStore.updateAll((element) => {
      const initialElement = moveState.initialElements.get(element.id);

      return initialElement
        ? moveElementByDelta(initialElement, { x: deltaX, y: deltaY })
        : element;
    });

    return true;
  }

  function finishMove() {
    const hadMove = moveRef.current !== null;
    moveRef.current = null;
    alignmentGuidesStore.clear();
    return hadMove;
  }

  return { finishMove, startMove, updateMove };
}
