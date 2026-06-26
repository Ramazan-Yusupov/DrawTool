import { useEffect, useRef } from "react";
import {
  createRectangle,
  normalizeElement,
  updateElement,
} from "@/entities/element";
import { screenToWorld, viewportStore } from "@/entities/viewport";
import { sceneStore } from "@/entities/scene";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";
import type { Point } from "@/shared/types";
import { activeToolStore } from "./activeToolStore";

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

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
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

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drawing = drawingRef.current;

    if (!drawing || drawing.pointerId !== event.pointerId) {
      return;
    }

    const screenPoint = getCanvasPointerPosition(
      event.nativeEvent,
      event.currentTarget,
    );

    const currentPoint = screenToWorld(screenPoint, viewportStore.get());

    sceneStore.updateById(drawing.elementId, (element) =>
      updateElement(element, {
        width: currentPoint.x - drawing.startPoint.x,
        height: currentPoint.y - drawing.startPoint.y,
      }),
    );
  }

  function finishDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const drawing = drawingRef.current;

    if (!drawing || drawing.pointerId !== event.pointerId) {
      return;
    }

    const element = sceneStore
      .get()
      .elements.find((item) => item.id === drawing.elementId);

    drawingRef.current = null;

    if (!element) {
      return;
    }

    const isTooSmall =
      Math.abs(element.width) < MIN_ELEMENT_SIZE ||
      Math.abs(element.height) < MIN_ELEMENT_SIZE;

    if (isTooSmall) {
      sceneStore.removeById(element.id);
    } else {
      sceneStore.updateById(element.id, normalizeElement);
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
