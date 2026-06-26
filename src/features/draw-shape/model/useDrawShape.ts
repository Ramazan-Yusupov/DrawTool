import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  createRectangle,
  normalizeElement,
  updateElement,
} from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { screenToWorld, viewportStore } from "@/entities/viewport";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";
import type { Point } from "@/shared/types";
import { getDrawingPoints } from "../lib/getDrawingPoints";
import { activeToolStore } from "./activeToolStore";
import { snapIndicatorStore } from "./snapIndicatorStore";

type DrawingState = {
  elementId: string;
  pointerId: number;
  startPoint: Point;
};

const MIN_ELEMENT_SIZE = 2;

export function useDrawShape() {
  const drawingRef = useRef<DrawingState | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "r") {
        activeToolStore.set("rectangle");
      }

      if (event.key === "Escape" || event.key.toLowerCase() === "v") {
        activeToolStore.set("selection");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function updateDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>,
    drawing: DrawingState,
  ) {
    const screenPoint = getCanvasPointerPosition(
      event.nativeEvent,
      event.currentTarget,
    );

    const currentPoint = screenToWorld(screenPoint, viewportStore.get());

    const points = getDrawingPoints(
      drawing.startPoint,
      currentPoint,
      event.shiftKey,
    );

    sceneStore.updateById(drawing.elementId, (element) =>
      updateElement(element, {
        x: points.startPoint.x,
        y: points.startPoint.y,
        width: points.endPoint.x - points.startPoint.x,
        height: points.endPoint.y - points.startPoint.y,
      }),
    );

    if (event.shiftKey) {
      snapIndicatorStore.set(points.endPoint);
      return;
    }

    snapIndicatorStore.clear();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || activeToolStore.get() !== "rectangle") {
      return;
    }

    const screenPoint = getCanvasPointerPosition(
      event.nativeEvent,
      event.currentTarget,
    );

    const startPoint = screenToWorld(screenPoint, viewportStore.get());

    const element = createRectangle({
      x: startPoint.x,
      y: startPoint.y,
      width: 0,
      height: 0,
    });

    drawingRef.current = {
      elementId: element.id,
      pointerId: event.pointerId,
      startPoint,
    };

    sceneStore.add(element);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drawing = drawingRef.current;

    if (!drawing || drawing.pointerId !== event.pointerId) {
      return;
    }

    updateDrawing(event, drawing);
  }

  function finishDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drawing = drawingRef.current;

    if (!drawing || drawing.pointerId !== event.pointerId) {
      return;
    }

    updateDrawing(event, drawing);

    const element = sceneStore
      .get()
      .elements.find((item) => item.id === drawing.elementId);

    drawingRef.current = null;
    snapIndicatorStore.clear();

    if (element) {
      const isTooSmall =
        Math.abs(element.width) < MIN_ELEMENT_SIZE ||
        Math.abs(element.height) < MIN_ELEMENT_SIZE;

      if (isTooSmall) {
        sceneStore.removeById(element.id);
      } else {
        sceneStore.updateById(element.id, normalizeElement);
      }
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: finishDrawing,
    onPointerCancel: finishDrawing,
  };
}
