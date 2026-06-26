import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { activeToolStore, useDrawShape } from "@/features/draw-shape";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";

type BoardCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const activeTool = useSyncExternalStore(
    activeToolStore.subscribe,
    activeToolStore.get,
    activeToolStore.get,
  );

  const panEvents = useCanvasPointerEvents();
  const drawingEvents = useDrawShape();

  useCanvasWheel(canvasRef);

  const cursorClass =
    activeTool === "rectangle" ? "cursor-crosshair" : "cursor-default";

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={`size-full touch-none ${cursorClass}`}
      onPointerDown={(event) => {
        panEvents.onPointerDown(event);
        drawingEvents.onPointerDown(event);
      }}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);
        drawingEvents.onPointerMove(event);
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerUp(event);
      }}
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerCancel(event);
      }}
    />
  );
}
