import { useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { hitTestElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { useDrawShape, useFreeDraw } from "@/features/draw-shape";
import { addImageFiles, getSupportedImageFiles, usePasteImages } from "@/features/add-image";
import { textEditorStore, useTextTool } from "@/features/edit-text";
import { useEraser } from "@/features/erase-elements";
import { useLaserPointer } from "@/features/laser-pointer";
import { useLassoSelect } from "@/features/lasso-select";
import { editingLockStore } from "@/features/lock-editing";
import { useSelectElements } from "@/features/select-elements";
import { useEyedropper } from "@/features/style-clipboard";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";
import { cn } from "@/shared/lib";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";
import { screenToWorld, viewportStore } from "@/entities/viewport";
import { BoardContextMenu } from "./BoardContextMenu";

type BoardCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

type PointerOwner =
  | "pan"
  | "selection"
  | "draw"
  | "freeDraw"
  | "eraser"
  | "laser"
  | "lasso";

type ActivePointerInteraction = {
  owner: PointerOwner;
  pointerId: number;
};

type ContextMenuState = {
  left: number;
  targetElementId?: string;
  targetIsLocked?: boolean;
  top: number;
};

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const activePointerRef = useRef<ActivePointerInteraction | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
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

  function setActivePointerOwner(
    event: React.PointerEvent<HTMLCanvasElement>,
    owner: PointerOwner,
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      activePointerRef.current = { owner, pointerId: event.pointerId };
    }
  }

  function clearActivePointerOwner(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current?.pointerId === event.pointerId) {
      activePointerRef.current = null;
    }
  }

  function getActivePointerOwner(event: React.PointerEvent<HTMLCanvasElement>) {
    const interaction = activePointerRef.current;
    return interaction?.pointerId === event.pointerId ? interaction.owner : null;
  }

  function onToolPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (activeTool === "selection") {
      selectionEvents.onPointerDown(event);
      setActivePointerOwner(event, "selection");
      return;
    }

    if (activeTool === "text") {
      return textEvents.onPointerDown(event);
    }


    if (activeTool === "eyedropper") {
      return eyedropperEvents.onPointerDown(event);
    }

    if (activeTool === "freedraw" || activeTool === "highlighter") {
      freeDrawEvents.onPointerDown(event);
      setActivePointerOwner(event, "freeDraw");
      return;
    }

    if (activeTool === "eraser") {
      eraserEvents.onPointerDown(event);
      setActivePointerOwner(event, "eraser");
      return;
    }

    if (activeTool === "laser") {
      laserEvents.onPointerDown(event);
      setActivePointerOwner(event, "laser");
      return;
    }

    if (activeTool === "lasso") {
      lassoEvents.onPointerDown(event);
      setActivePointerOwner(event, "lasso");
      return;
    }

    if (activeTool !== "pan") {
      drawingEvents.onPointerDown(event);
      setActivePointerOwner(event, "draw");
    }
  }

  function onToolPointerMove(
    event: React.PointerEvent<HTMLCanvasElement>,
    owner: PointerOwner | null = null,
  ) {
    const hasFixedOwner = owner !== null;
    const toolOwner = owner ?? activeTool;

    if (toolOwner === "selection") {
      return selectionEvents.onPointerMove(event);
    }

    if (
      toolOwner === "freeDraw" ||
      (!hasFixedOwner &&
        (activeTool === "freedraw" || activeTool === "highlighter"))
    ) {
      return freeDrawEvents.onPointerMove(event);
    }

    if (toolOwner === "eraser") {
      return eraserEvents.onPointerMove(event);
    }

    if (toolOwner === "laser") {
      return laserEvents.onPointerMove(event);
    }

    if (toolOwner === "lasso") {
      return lassoEvents.onPointerMove(event);
    }

    if (
      toolOwner === "draw" ||
      (!hasFixedOwner &&
        activeTool !== "text" &&
        activeTool !== "eyedropper" &&
        activeTool !== "pan")
    ) {
      return drawingEvents.onPointerMove(event);
    }
  }

  function onToolPointerUp(
    event: React.PointerEvent<HTMLCanvasElement>,
    owner: PointerOwner | null = null,
  ) {
    const hasFixedOwner = owner !== null;
    const toolOwner = owner ?? activeTool;

    if (toolOwner === "selection") {
      return selectionEvents.onPointerUp(event);
    }

    if (
      toolOwner === "freeDraw" ||
      (!hasFixedOwner &&
        (activeTool === "freedraw" || activeTool === "highlighter"))
    ) {
      return freeDrawEvents.onPointerUp(event);
    }

    if (toolOwner === "eraser") {
      return eraserEvents.onPointerUp(event);
    }

    if (toolOwner === "laser") {
      return laserEvents.onPointerUp(event);
    }

    if (toolOwner === "lasso") {
      return lassoEvents.onPointerUp(event);
    }

    if (
      toolOwner === "draw" ||
      (!hasFixedOwner &&
        activeTool !== "text" &&
        activeTool !== "eyedropper" &&
        activeTool !== "pan")
    ) {
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

  function onToolPointerCancel(
    event: React.PointerEvent<HTMLCanvasElement>,
    owner: PointerOwner | null = null,
  ) {
    const hasFixedOwner = owner !== null;
    const toolOwner = owner ?? activeTool;

    if (toolOwner === "selection") {
      return selectionEvents.onPointerCancel(event);
    }

    if (
      toolOwner === "freeDraw" ||
      (!hasFixedOwner &&
        (activeTool === "freedraw" || activeTool === "highlighter"))
    ) {
      return freeDrawEvents.onPointerCancel(event);
    }

    if (toolOwner === "eraser") {
      return eraserEvents.onPointerCancel(event);
    }

    if (toolOwner === "laser") {
      return laserEvents.onPointerCancel(event);
    }

    if (toolOwner === "lasso") {
      return lassoEvents.onPointerCancel(event);
    }

    if (
      toolOwner === "draw" ||
      (!hasFixedOwner &&
        activeTool !== "eyedropper" &&
        activeTool !== "pan")
    ) {
      return drawingEvents.onPointerCancel(event);
    }
  }

  function getContextTarget(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvasPoint = getCanvasPointerPosition(event.nativeEvent, event.currentTarget);
    const worldPoint = screenToWorld(canvasPoint, viewportStore.get());
    return [...sceneStore.get().elements]
      .reverse()
      .find((element) => hitTestElement(element, worldPoint));
  }

  return (
    <>
      <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className={cn("size-full touch-none", cursorClass)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onContextMenu={(event) => {
        event.preventDefault();
        const target = getContextTarget(event);

        if (target && !target.locked) {
          const selectedIds = selectionStore.get().elementIds;
          if (!selectedIds.includes(target.id)) {
            const groupIds = target.groupId
              ? sceneStore
                  .get()
                  .elements.filter((element) => element.groupId === target.groupId && !element.locked)
                  .map((element) => element.id)
              : [target.id];
            selectionStore.setElementIds(groupIds);
          }
        }

        setContextMenu({
          left: event.clientX,
          targetElementId: target?.id,
          targetIsLocked: Boolean(target?.locked),
          top: event.clientY,
        });
      }}
      onDoubleClick={(event) => {
        if (!isPanOnly && activeTool === "selection") {
          selectionEvents.onDoubleClick(event);
        }
      }}
      onPointerCancel={(event) => {
        const owner = getActivePointerOwner(event);

        if (owner === "pan") {
          panEvents.onPointerUp(event);
        } else if (owner) {
          onToolPointerCancel(event, owner);
        } else {
          panEvents.onPointerUp(event);

          if (!isPanOnly) {
            onToolPointerCancel(event);
          }
        }

        clearActivePointerOwner(event);
      }}
      onPointerDown={(event) => {
        if (contextMenu) {
          setContextMenu(null);
        }

        /*
         * Первый клик за пределами textarea подтверждает текст через blur.
         * Canvas в этот момент не должен начинать другой инструмент.
         */
        if (textEditorStore.get().elementId) {
          return;
        }

        panEvents.onPointerDown(event, isPanOnly);
        setActivePointerOwner(event, "pan");

        if (!isPanOnly && getActivePointerOwner(event) !== "pan") {
          onToolPointerDown(event);
        }
      }}
      onPointerLeave={drawingEvents.onPointerLeave}
      onPointerMove={(event) => {
        const owner = getActivePointerOwner(event);

        if (owner === "pan") {
          panEvents.onPointerMove(event);
        } else if (owner) {
          onToolPointerMove(event, owner);
        } else {
          panEvents.onPointerMove(event);

          if (!isPanOnly) {
            onToolPointerMove(event);
          }
        }
      }}
      onPointerUp={(event) => {
        const owner = getActivePointerOwner(event);

        if (owner === "pan") {
          panEvents.onPointerUp(event);
        } else if (owner) {
          onToolPointerUp(event, owner);
        } else {
          panEvents.onPointerUp(event);

          if (!isPanOnly) {
            onToolPointerUp(event);
          }
        }

        clearActivePointerOwner(event);
      }}
      />

      {contextMenu && (
          <BoardContextMenu
            left={contextMenu.left}
            onClose={() => setContextMenu(null)}
            targetElementId={contextMenu.targetElementId}
            targetIsLocked={contextMenu.targetIsLocked}
            top={contextMenu.top}
          />
      )}
    </>
  );
}
