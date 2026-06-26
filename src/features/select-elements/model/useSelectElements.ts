import { useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { hitTestElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { textEditorStore } from "@/features/edit-text";
import { useMoveElements } from "@/features/move-elements";
import { findResizeHandleAtPoint, useResizeElements } from "@/features/resize-elements";
import { viewportStore } from "@/entities/viewport";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";
import type { Point, Rect } from "@/shared/types";
import { getElementsInSelectionBox } from "../lib/getElementsInSelectionBox";

type SelectionInteraction =
  | { mode: "area"; pointerId: number; startPoint: Point; append: boolean }
  | { mode: "move"; pointerId: number }
  | { mode: "resize"; pointerId: number }
  | null;

function normalizeRect(start: Point, end: Point): Rect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function useSelectElements() {
  const interactionRef = useRef<SelectionInteraction>(null);
  const move = useMoveElements();
  const resize = useResizeElements();

  function findTopElement(point: Point) {
    return [...sceneStore.get().elements]
      .reverse()
      .find((element) => hitTestElement(element, point));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) {
      return;
    }

    const point = getWorldPointerPosition(event);
    const selection = selectionStore.get();
    const selectedElement =
      selection.elementIds.length === 1
        ? sceneStore
            .get()
            .elements.find((element) => element.id === selection.elementIds[0])
        : undefined;
    const handle = selectedElement
      ? findResizeHandleAtPoint(selectedElement, point, 10 / viewportStore.get().zoom)
      : null;

    if (selectedElement && handle) {
      event.currentTarget.setPointerCapture(event.pointerId);
      resize.startResize(selectedElement.id, handle, point);
      interactionRef.current = { mode: "resize", pointerId: event.pointerId };
      return;
    }

    const hitElement = findTopElement(point);

    if (hitElement) {
      const isAlreadySelected = selection.elementIds.includes(hitElement.id);
      const elementIds = event.shiftKey
        ? selection.elementIds.includes(hitElement.id)
          ? selection.elementIds.filter((id) => id !== hitElement.id)
          : [...selection.elementIds, hitElement.id]
        : isAlreadySelected
          ? selection.elementIds
          : [hitElement.id];

      selectionStore.setElementIds(elementIds);

      if (!event.shiftKey && elementIds.length > 0) {
        event.currentTarget.setPointerCapture(event.pointerId);
        move.startMove(elementIds, point);
        interactionRef.current = { mode: "move", pointerId: event.pointerId };
      }

      return;
    }

    if (!event.shiftKey) {
      selectionStore.setElementIds([]);
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    selectionStore.setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 });
    interactionRef.current = {
      mode: "area",
      pointerId: event.pointerId,
      startPoint: point,
      append: event.shiftKey,
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    const point = getWorldPointerPosition(event);

    if (interaction.mode === "resize") {
      resize.updateResize(point);
      return;
    }

    if (interaction.mode === "move") {
      move.updateMove(point);
      return;
    }

    selectionStore.setSelectionBox(normalizeRect(interaction.startPoint, point));
  }

  function finishInteraction(event: ReactPointerEvent<HTMLCanvasElement>) {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    if (interaction.mode === "area") {
      const selectionBox = selectionStore.get().selectionBox;
      if (selectionBox) {
        const ids = getElementsInSelectionBox(
          sceneStore.get().elements,
          selectionBox,
        ).map((element) => element.id);
        selectionStore.setElementIds(
          interaction.append
            ? [...selectionStore.get().elementIds, ...ids]
            : ids,
        );
      }
    }

    move.finishMove();
    resize.finishResize();
    interactionRef.current = null;
    selectionStore.setSelectionBox(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onDoubleClick(event: ReactMouseEvent<HTMLCanvasElement>) {
    const hitElement = findTopElement(getWorldPointerPosition(event));
    if (hitElement?.type === "text") {
      selectionStore.setElementIds([hitElement.id]);
      textEditorStore.open(hitElement.id);
    }
  }

  return {
    onDoubleClick,
    onPointerCancel: finishInteraction,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishInteraction,
  };
}
