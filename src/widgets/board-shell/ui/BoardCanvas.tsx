import { useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { toolStore } from "@/entities/tool";
import { useDrawShape, useFreeDraw } from "@/features/draw-shape";
import { addImageFiles, getSupportedImageFiles, usePasteImages } from "@/features/add-image";
import { textEditorStore, useTextTool } from "@/features/edit-text";
import { useEraser } from "@/features/erase-elements";
import { useLaserPointer } from "@/features/laser-pointer";
import { useLassoSelect } from "@/features/lasso-select";
import { editingLockStore } from "@/features/lock-editing";
import { useSelectElements } from "@/features/select-elements";
import { useStickerTool } from "@/features/add-sticker";
import { useEyedropper } from "@/features/style-clipboard";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";
import { cn } from "@/shared/lib";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";
import { screenToWorld, viewportStore } from "@/entities/viewport";

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
  const stickerEvents = useStickerTool();
  const eyedropperEvents = useEyedropper();

  useCanvasWheel(canvasRef);
  usePasteImages();

  const isPanOnly = isLocked || activeTool === "pan";

  const cursorClass = isPanOnly
    ? "cursor-grab active:cursor-grabbing"
    : activeTool === "selection"
      ? "cursor-default"
      : activeTool === "eraser"
        ? "cursor-cell"
        : activeTool === "eyedropper"
          ? "cursor-copy"
          : "cursor-crosshair";

  function onToolPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerDown(event);
    }

    if (activeTool === "text") {
      return textEvents.onPointerDown(event);
    }

    if (activeTool === "sticker") {
      return stickerEvents.onPointerDown(event);
    }

    if (activeTool === "eyedropper") {
      return eyedropperEvents.onPointerDown(event);
    }

    if (activeTool === "freedraw" || activeTool === "highlighter") {
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

    if (activeTool === "freedraw" || activeTool === "highlighter") {
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

    if (activeTool !== "text" && activeTool !== "sticker" && activeTool !== "eyedropper" && activeTool !== "pan") {
      return drawingEvents.onPointerMove(event);
    }
  }

  function onToolPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerUp(event);
    }

    if (activeTool === "freedraw" || activeTool === "highlighter") {
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

    if (activeTool !== "text" && activeTool !== "sticker" && activeTool !== "eyedropper" && activeTool !== "pan") {
      return drawingEvents.onPointerUp(event);
    }
  }

  function onDragOver(event: React.DragEvent<HTMLCanvasElement>) {
    if (getSupportedImageFiles(event.dataTransfer.files).length > 0) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function onDrop(event: React.DragEvent<HTMLCanvasElement>) {
    const files = getSupportedImageFiles(event.dataTransfer.files);

    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    const canvasPoint = getCanvasPointerPosition(event.nativeEvent, event.currentTarget);
    const worldPoint = screenToWorld(canvasPoint, viewportStore.get());
    void addImageFiles(files, worldPoint).catch(() => undefined);
  }

  function onToolPointerCancel(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      return selectionEvents.onPointerCancel(event);
    }

    if (activeTool === "freedraw" || activeTool === "highlighter") {
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

    if (activeTool !== "sticker" && activeTool !== "eyedropper" && activeTool !== "pan") {
      return drawingEvents.onPointerCancel(event);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={cn("size-full touch-none", cursorClass)}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
