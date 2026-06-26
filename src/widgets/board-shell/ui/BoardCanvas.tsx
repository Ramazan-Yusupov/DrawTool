import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { toolStore } from "@/entities/tool";
import { useDrawShape, useFreeDraw } from "@/features/draw-shape";
import { useEraser } from "@/features/erase-elements";
import { useTextTool } from "@/features/edit-text";
import { useLaserPointer } from "@/features/laser-pointer";
import { useLassoSelect } from "@/features/lasso-select";
import { useSelectElements } from "@/features/select-elements";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";

type BoardCanvasProps = { canvasRef: RefObject<HTMLCanvasElement | null> };

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );
  const panEvents = useCanvasPointerEvents();
  const drawingEvents = useDrawShape();
  const freeDrawEvents = useFreeDraw();
  const eraserEvents = useEraser();
  const laserEvents = useLaserPointer();
  const lassoEvents = useLassoSelect();
  const selectionEvents = useSelectElements();
  const textEvents = useTextTool();

  useCanvasWheel(canvasRef);

  const cursorClass =
    activeTool === "selection"
      ? "cursor-default"
      : activeTool === "eraser"
        ? "cursor-cell"
        : activeTool === "laser"
          ? "cursor-crosshair"
          : "cursor-crosshair";

  function onToolPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") return selectionEvents.onPointerDown(event);
    if (activeTool === "text") return textEvents.onPointerDown(event);
    if (activeTool === "freedraw") return freeDrawEvents.onPointerDown(event);
    if (activeTool === "eraser") return eraserEvents.onPointerDown(event);
    if (activeTool === "laser") return laserEvents.onPointerDown(event);
    if (activeTool === "lasso") return lassoEvents.onPointerDown(event);
    return drawingEvents.onPointerDown(event);
  }

  function onToolPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") return selectionEvents.onPointerMove(event);
    if (activeTool === "freedraw") return freeDrawEvents.onPointerMove(event);
    if (activeTool === "eraser") return eraserEvents.onPointerMove(event);
    if (activeTool === "laser") return laserEvents.onPointerMove(event);
    if (activeTool === "lasso") return lassoEvents.onPointerMove(event);
    if (activeTool !== "text") return drawingEvents.onPointerMove(event);
  }

  function onToolPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") return selectionEvents.onPointerUp(event);
    if (activeTool === "freedraw") return freeDrawEvents.onPointerUp(event);
    if (activeTool === "eraser") return eraserEvents.onPointerUp(event);
    if (activeTool === "laser") return laserEvents.onPointerUp(event);
    if (activeTool === "lasso") return lassoEvents.onPointerUp(event);
    if (activeTool !== "text") return drawingEvents.onPointerUp(event);
  }

  function onToolPointerCancel(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") return selectionEvents.onPointerCancel(event);
    if (activeTool === "freedraw") return freeDrawEvents.onPointerCancel(event);
    if (activeTool === "eraser") return eraserEvents.onPointerCancel(event);
    if (activeTool === "laser") return laserEvents.onPointerCancel(event);
    if (activeTool === "lasso") return lassoEvents.onPointerCancel(event);
    return drawingEvents.onPointerCancel(event);
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={`size-full touch-none ${cursorClass}`}
      onDoubleClick={(event) => {
        if (activeTool === "selection") selectionEvents.onDoubleClick(event);
      }}
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);
        onToolPointerCancel(event);
      }}
      onPointerDown={(event) => {
        panEvents.onPointerDown(event);
        onToolPointerDown(event);
      }}
      onPointerLeave={drawingEvents.onPointerLeave}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);
        onToolPointerMove(event);
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);
        onToolPointerUp(event);
      }}
    />
  );
}
