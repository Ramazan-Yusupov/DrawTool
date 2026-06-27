import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { hitTestElement, updateElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import type { ShapeToolId, ToolId } from "@/entities/tool";
import { toolStore } from "@/entities/tool";
import { attachFrameChildren, findContainingFrame, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolSettingsStore } from "@/features/change-style";
import { toolLockStore } from "@/features/tool-lock";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";
import type { Point } from "@/shared/types";
import { getDrawingPoints } from "../lib/getDrawingPoints";
import { getWorldPointerPosition } from "../lib/getWorldPointerPosition";
import { getShapePreview } from "../lib/getShapePreview";
import { drawShape } from "./drawShape";
import { snapIndicatorStore } from "./snapIndicatorStore";

type DrawingState = {
  elementId: string;
  pointerId: number;
  startPoint: Point;
  toolId: ShapeToolId;
};

const MIN_ELEMENT_SIZE = 2;

const CLICK_DEFAULT_SIZES: Partial<Record<ShapeToolId, { width: number; height: number }>> = {
  sticky: { width: 220, height: 160 },
  callout: { width: 260, height: 120 },
  table: { width: 420, height: 210 },
};

function getElementAtPoint(point: Point, excludedId: string) {
  return [...sceneStore.get().elements]
    .reverse()
    .find((candidate) => candidate.id !== excludedId && hitTestElement(candidate, point));
}

function isShapeTool(toolId: ToolId): toolId is ShapeToolId {
  return [
    "rectangle",
    "ellipse",
    "diamond",
    "triangle",
    "hexagon",
    "star",
    "cloud",
    "frame",
    "embed",
    "line",
    "arrow",
    "measure",
    "sticky",
    "callout",
    "table",
  ].includes(toolId);
}

function getConstraint(toolId: ShapeToolId) {
  return toolId === "line" || toolId === "arrow" || toolId === "measure" ? "angle" : "square";
}

function isTooSmall(width: number, height: number, toolId: ShapeToolId) {
  if (toolId === "line" || toolId === "arrow" || toolId === "measure") {
    return Math.hypot(width, height) < MIN_ELEMENT_SIZE;
  }

  return (
    Math.abs(width) < MIN_ELEMENT_SIZE || Math.abs(height) < MIN_ELEMENT_SIZE
  );
}

export function useDrawShape() {
  const drawingRef = useRef<DrawingState | null>(null);

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

    historyStore.begin();

    const element = getShapePreview(
      activeTool,
      startPoint,
      startPoint,
      settings.style,
      settings.arrowRouting,
    );

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
      drawShape(element, points.startPoint, points.endPoint),
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
        const defaultSize = CLICK_DEFAULT_SIZES[drawing.toolId];
        if (defaultSize) {
          sceneStore.updateById(element.id, (current) =>
            updateElement(current, {
              x: drawing.toolId === "callout" ? drawing.startPoint.x + 42 : drawing.startPoint.x,
              y: drawing.toolId === "callout" ? drawing.startPoint.y + 34 : drawing.startPoint.y,
              width: defaultSize.width,
              height: defaultSize.height,
            }),
          );
        } else {
          sceneStore.removeById(element.id);
        }
      }

      const normalizedElement = sceneStore
        .get()
        .elements.find((item) => item.id === element.id);

      if (normalizedElement) {
        if (normalizedElement.type === "arrow") {
          const startTarget = getElementAtPoint(drawing.startPoint, normalizedElement.id);
          const endTarget = getElementAtPoint(
            { x: normalizedElement.x + normalizedElement.width, y: normalizedElement.y + normalizedElement.height },
            normalizedElement.id,
          );
          if (startTarget || endTarget) {
            sceneStore.updateById(normalizedElement.id, (current) =>
              current.type === "arrow"
                ? updateElement(current, {
                    startBinding: startTarget ? { elementId: startTarget.id, focus: 0 } : undefined,
                    endBinding: endTarget ? { elementId: endTarget.id, focus: 0 } : undefined,
                  })
                : current,
            );
          }
        }

        if (normalizedElement.type === "callout") {
          const target = getElementAtPoint(drawing.startPoint, normalizedElement.id);
          if (target) {
            sceneStore.updateById(normalizedElement.id, (current) =>
              current.type === "callout"
                ? updateElement(current, { targetId: target.id })
                : current,
            );
          }
        }

        if (normalizedElement?.type === "frame") {
          sceneStore.setElements(
            attachFrameChildren(sceneStore.get().elements, normalizedElement.id),
          );
        } else if (normalizedElement) {
          const parentFrame = findContainingFrame(
            normalizedElement,
            sceneStore.get().elements,
          );

          if (parentFrame) {
            sceneStore.updateById(normalizedElement.id, (current) =>
              updateElement(current, { parentId: parentFrame.id }),
            );
          }
        }

        /*
         * Фигуры — одноразовые инструменты: после завершения сразу
         * переключаемся на курсор и выделяем созданный объект, чтобы его
         * можно было сразу передвинуть, изменить или повернуть.
         */
        selectionStore.setElementIds([element.id]);
        if (!toolLockStore.get()) {
          toolStore.set("selection");
        }
      }
    }

    historyStore.commit();

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
