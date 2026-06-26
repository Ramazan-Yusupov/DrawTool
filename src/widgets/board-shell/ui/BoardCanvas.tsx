import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { toolStore } from "@/entities/tool";
import { useDrawShape } from "@/features/draw-shape";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";

type BoardCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
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
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerCancel(event);
      }}
      onPointerDown={(event) => {
        panEvents.onPointerDown(event);
        drawingEvents.onPointerDown(event);
      }}
      onPointerLeave={drawingEvents.onPointerLeave}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);
        drawingEvents.onPointerMove(event);
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerUp(event);
      }}
    />
  );
}
