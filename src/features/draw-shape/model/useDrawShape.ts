import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { normalizeElement, updateElement } from "@/entities/element";
import type { ShapeToolId, ToolId } from "@/entities/tool";
import { toolStore } from "@/entities/tool";
import { sceneStore } from "@/entities/scene";
import { toolSettingsStore } from "@/features/change-style";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";
import type { Point } from "@/shared/types";
import { getDrawingPoints } from "../lib/getDrawingPoints";
import { getWorldPointerPosition } from "../lib/getWorldPointerPosition";
import { createElementByTool } from "./createElementByTool";
import { snapIndicatorStore } from "./snapIndicatorStore";

type DrawingState = {
  elementId: string;
  pointerId: number;
  startPoint: Point;
  toolId: ShapeToolId;
};

const MIN_ELEMENT_SIZE = 2;

const TOOL_BY_SHORTCUT: Partial<Record<string, ToolId>> = {
  a: "arrow",
  d: "diamond",
  e: "ellipse",
  l: "line",
  r: "rectangle",
  t: "text",
  v: "selection",
};

function isShapeTool(toolId: ToolId): toolId is ShapeToolId {
  return ["rectangle", "ellipse", "diamond", "line", "arrow"].includes(toolId);
}

function getConstraint(toolId: ShapeToolId) {
  return toolId === "line" || toolId === "arrow" ? "angle" : "square";
}

function isTooSmall(width: number, height: number, toolId: ShapeToolId) {
  if (toolId === "line" || toolId === "arrow") {
    return Math.hypot(width, height) < MIN_ELEMENT_SIZE;
  }

  return (
    Math.abs(width) < MIN_ELEMENT_SIZE || Math.abs(height) < MIN_ELEMENT_SIZE
  );
}

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

      if (event.key === "Escape") {
        toolStore.set("selection");
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const nextTool = TOOL_BY_SHORTCUT[event.key.toLowerCase()];

      if (nextTool) {
        toolStore.set(nextTool);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function updateIdleIndicator(event: ReactPointerEvent<HTMLCanvasElement>) {
    const activeTool = toolStore.get();

    if (!isShapeTool(activeTool)) {
      snapIndicatorStore.clear();
      return;
    }

    const settings = toolSettingsStore.get(activeTool);

    if (!settings.snapToGrid) {
      snapIndicatorStore.clear();
      return;
    }

    const point = getWorldPointerPosition(event);
    snapIndicatorStore.set(snapPointToGrid(point, settings.snapSize));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const activeTool = toolStore.get();

    if (event.button !== 0 || !isShapeTool(activeTool)) {
      return;
    }

    const rawStartPoint = getWorldPointerPosition(event);
    const settings = toolSettingsStore.get(activeTool);
    const constraint = getConstraint(activeTool);

    const { startPoint } = getDrawingPoints(
      rawStartPoint,
      rawStartPoint,
      event.shiftKey,
      settings.snapToGrid,
      settings.snapSize,
      constraint,
    );

    const element = createElementByTool({
      startPoint,
      style: settings.style,
      toolId: activeTool,
      arrowRouting: settings.arrowRouting,
    });

    drawingRef.current = {
      elementId: element.id,
      pointerId: event.pointerId,
      startPoint,
      toolId: activeTool,
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
    const settings = toolSettingsStore.get(drawing.toolId);

    const points = getDrawingPoints(
      drawing.startPoint,
      currentPoint,
      event.shiftKey,
      settings.snapToGrid,
      settings.snapSize,
      getConstraint(drawing.toolId),
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
      if (isTooSmall(element.width, element.height, drawing.toolId)) {
        sceneStore.removeById(element.id);
      } else if (drawing.toolId !== "line" && drawing.toolId !== "arrow") {
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
