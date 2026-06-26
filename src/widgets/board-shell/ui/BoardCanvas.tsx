import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { toolStore } from "@/entities/tool";
import { useDrawShape } from "@/features/draw-shape";
import { useTextTool } from "@/features/edit-text";
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
  const selectionEvents = useSelectElements();
  const textEvents = useTextTool();

  useCanvasWheel(canvasRef);

  const cursorClass =
    activeTool === "selection" ? "cursor-default" : "cursor-crosshair";

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={`size-full touch-none ${cursorClass}`}
      onDoubleClick={(event) => {
        if (activeTool === "selection") {
          selectionEvents.onDoubleClick(event);
        }
      }}
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerCancel(event);
        selectionEvents.onPointerCancel(event);
      }}
      onPointerDown={(event) => {
        panEvents.onPointerDown(event);

        if (activeTool === "selection") {
          selectionEvents.onPointerDown(event);
        } else if (activeTool === "text") {
          textEvents.onPointerDown(event);
        } else {
          drawingEvents.onPointerDown(event);
        }
      }}
      onPointerLeave={drawingEvents.onPointerLeave}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);

        if (activeTool === "selection") {
          selectionEvents.onPointerMove(event);
        } else if (activeTool !== "text") {
          drawingEvents.onPointerMove(event);
        }
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);

        if (activeTool === "selection") {
          selectionEvents.onPointerUp(event);
        } else if (activeTool !== "text") {
          drawingEvents.onPointerUp(event);
        }
      }}
    />
  );
}
