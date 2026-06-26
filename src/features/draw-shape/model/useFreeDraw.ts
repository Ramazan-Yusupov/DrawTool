import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createFreeDraw, updateElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { toolSettingsStore } from "@/features/change-style";
import { getWorldPointerPosition } from "../lib/getWorldPointerPosition";
import type { Point } from "@/shared/types";

type DrawState = {
  elementId: string;
  pointerId: number;
  points: Point[];
};

function getPointsBounds(points: Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}

export function useFreeDraw() {
  const drawRef = useRef<DrawState | null>(null);

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) {
      return;
    }

    const point = getWorldPointerPosition(event);
    const settings = toolSettingsStore.get("freedraw");
    const element = createFreeDraw({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      style: settings.style,
      points: [point],
    });

    historyStore.begin();
    sceneStore.add(element);
    drawRef.current = { elementId: element.id, pointerId: event.pointerId, points: [point] };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const activeDraw = drawRef.current;
    if (!activeDraw || activeDraw.pointerId !== event.pointerId) {
      return;
    }

    const point = getWorldPointerPosition(event);
    const previousPoint = activeDraw.points.at(-1);
    if (previousPoint && Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) < 1.25) {
      return;
    }

    const points = [...activeDraw.points, point];
    activeDraw.points = points;
    const bounds = getPointsBounds(points);

    sceneStore.updateById(activeDraw.elementId, (element) =>
      element.type === "freedraw"
        ? updateElement(element, { ...bounds, points })
        : element,
    );
  }

  function finish(event: ReactPointerEvent<HTMLCanvasElement>) {
    const activeDraw = drawRef.current;
    if (!activeDraw || activeDraw.pointerId !== event.pointerId) {
      return;
    }

    drawRef.current = null;
    if (activeDraw.points.length < 2) {
      sceneStore.removeById(activeDraw.elementId);
    }
    historyStore.commit();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    onPointerCancel: finish,
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
  };
}
