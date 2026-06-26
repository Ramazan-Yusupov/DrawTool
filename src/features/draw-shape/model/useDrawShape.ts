import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  createRectangle,
  normalizeElement,
  updateElement,
} from "@/entities/element";
import { toolStore } from "@/entities/tool";
import { sceneStore } from "@/entities/scene";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";
import type { Point } from "@/shared/types";
import { toolSettingsStore } from "@/features/change-style";
import { getDrawingPoints } from "../lib/getDrawingPoints";
import { getWorldPointerPosition } from "../lib/getWorldPointerPosition";
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
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        target.matches("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key.toLowerCase() === "r") {
        toolStore.set("rectangle");
      }

      if (event.key === "Escape" || event.key.toLowerCase() === "v") {
        toolStore.set("selection");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function updateIdleIndicator(event: ReactPointerEvent<HTMLCanvasElement>) {
    const settings = toolSettingsStore.get("rectangle");

    if (toolStore.get() !== "rectangle" || !settings.snapToGrid) {
      snapIndicatorStore.clear();
      return;
    }

    const point = getWorldPointerPosition(event);

    snapIndicatorStore.set(snapPointToGrid(point, settings.snapSize));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || toolStore.get() !== "rectangle") {
      return;
    }

    const rawStartPoint = getWorldPointerPosition(event);
    const settings = toolSettingsStore.get("rectangle");

    const { startPoint } = getDrawingPoints(
      rawStartPoint,
      rawStartPoint,
      event.shiftKey,
      settings.snapToGrid,
      settings.snapSize,
    );

    const element = createRectangle({
      x: startPoint.x,
      y: startPoint.y,
      width: 0,
      height: 0,
      style: settings.style,
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
      updateIdleIndicator(event);
      return;
    }

    const currentPoint = getWorldPointerPosition(event);
    const settings = toolSettingsStore.get("rectangle");

    const points = getDrawingPoints(
      drawing.startPoint,
      currentPoint,
      event.shiftKey,
      settings.snapToGrid,
      settings.snapSize,
    );

    sceneStore.updateById(drawing.elementId, (element) =>
      updateElement(element, {
        x: points.startPoint.x,
        y: points.startPoint.y,
        width: points.endPoint.x - points.startPoint.x,
        height: points.endPoint.y - points.startPoint.y,
      }),
    );

    if (event.shiftKey || settings.snapToGrid) {
      snapIndicatorStore.set(points.endPoint);
    } else {
      snapIndicatorStore.clear();
    }
  }

  function finishDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drawing = drawingRef.current;

    if (!drawing || drawing.pointerId !== event.pointerId) {
      return;
    }

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
    onPointerLeave: snapIndicatorStore.clear,
    onPointerMove,
    onPointerUp: finishDrawing,
    onPointerCancel: finishDrawing,
  };
}
