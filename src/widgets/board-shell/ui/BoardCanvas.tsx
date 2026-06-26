import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { toolStore } from "@/entities/tool";
import { useDrawShape, useFreeDraw } from "@/features/draw-shape";
import { textEditorStore, useTextTool } from "@/features/edit-text";
import { useEraser } from "@/features/erase-elements";
import { useLaserPointer } from "@/features/laser-pointer";
import { useLassoSelect } from "@/features/lasso-select";
import { editingLockStore } from "@/features/lock-editing";
import { useSelectElements } from "@/features/select-elements";
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

  const { isLocked } = useSyncExternalStore(
    editingLockStore.subscribe,
    editingLockStore.get,
    editingLockStore.get,
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

  const isPanOnly = isLocked || activeTool === "pan";

  const cursorClass = isPanOnly
    ? "cursor-grab active:cursor-grabbing"
    : activeTool === "selection"
      ? "cursor-default"
      : activeTool === "eraser"
        ? "cursor-cell"
        : "cursor-crosshair";

  function onToolPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerDown(event);
    }

    if (activeTool === "text") {
      return textEvents.onPointerDown(event);
    }

    if (activeTool === "freedraw") {
      return freeDrawEvents.onPointerDown(event);
    }

    if (activeTool === "eraser") {
      return eraserEvents.onPointerDown(event);
    }

    if (activeTool === "laser") {
      return laserEvents.onPointerDown(event);
    }

    if (activeTool === "lasso") {
      return lassoEvents.onPointerDown(event);
    }

    if (activeTool !== "pan") {
      return drawingEvents.onPointerDown(event);
    }
  }

  function onToolPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerMove(event);
    }

    if (activeTool === "freedraw") {
      return freeDrawEvents.onPointerMove(event);
    }

    if (activeTool === "eraser") {
      return eraserEvents.onPointerMove(event);
    }

    if (activeTool === "laser") {
      return laserEvents.onPointerMove(event);
    }

    if (activeTool === "lasso") {
      return lassoEvents.onPointerMove(event);
    }

    if (activeTool !== "text" && activeTool !== "pan") {
      return drawingEvents.onPointerMove(event);
    }
  }

  function onToolPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerUp(event);
    }

    if (activeTool === "freedraw") {
      return freeDrawEvents.onPointerUp(event);
    }

    if (activeTool === "eraser") {
      return eraserEvents.onPointerUp(event);
    }

    if (activeTool === "laser") {
      return laserEvents.onPointerUp(event);
    }

    if (activeTool === "lasso") {
      return lassoEvents.onPointerUp(event);
    }

    if (activeTool !== "text" && activeTool !== "pan") {
      return drawingEvents.onPointerUp(event);
    }
  }

  function onToolPointerCancel(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerCancel(event);
    }

    if (activeTool === "freedraw") {
      return freeDrawEvents.onPointerCancel(event);
    }

    if (activeTool === "eraser") {
      return eraserEvents.onPointerCancel(event);
    }

    if (activeTool === "laser") {
      return laserEvents.onPointerCancel(event);
    }

    if (activeTool === "lasso") {
      return lassoEvents.onPointerCancel(event);
    }

    if (activeTool !== "pan") {
      return drawingEvents.onPointerCancel(event);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={`size-full touch-none ${cursorClass}`}
      onDoubleClick={(event) => {
        if (!isPanOnly && activeTool === "selection") {
          selectionEvents.onDoubleClick(event);
        }
      }}
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);

        if (!isPanOnly) {
          onToolPointerCancel(event);
        }
      }}
      onPointerDown={(event) => {
        /*
         * Первый клик за пределами textarea подтверждает текст через blur.
         * Canvas в этот момент не должен начинать другой инструмент.
         */
        if (textEditorStore.get().elementId) {
          return;
        }

        panEvents.onPointerDown(event, isPanOnly);

        if (!isPanOnly) {
          onToolPointerDown(event);
        }
      }}
      onPointerLeave={drawingEvents.onPointerLeave}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);

        if (!isPanOnly) {
          onToolPointerMove(event);
        }
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);

        if (!isPanOnly) {
          onToolPointerUp(event);
        }
      }}
    />
  );
}
