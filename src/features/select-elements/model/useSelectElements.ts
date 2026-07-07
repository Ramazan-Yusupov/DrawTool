import { useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  createArrowBinding,
  findArrowBindingTarget,
  getArrowBindingAnchor,
  getElementCenter,
  getElementRotation,
  hitTestElement,
  updateElement,
} from "@/entities/element";
import type { ElementBinding } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { textEditorStore } from "@/features/edit-text";
import { editingLockStore } from "@/features/lock-editing";
import { arrowBindingIndicatorStore } from "@/features/arrow-binding";
import { ROTATION_SNAP_ANGLE, snapRotationAngle } from "@/features/rotate-elements";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";
import { useMoveElements } from "@/features/move-elements";
import {
  findResizeHandleAtPoint,
  getElementRotationHandle,
  getResizeCursor,
  useResizeElements,
} from "@/features/resize-elements";
import { viewportStore } from "@/entities/viewport";
import { normalizeAngleDelta } from "@/shared/lib";
import type { Point, Rect } from "@/shared/types";
import { selectByArea } from "./selectByArea";

const ARROW_BINDING_RADIUS = 18;

type SelectionInteraction =
  | { mode: "area"; pointerId: number; startPoint: Point; append: boolean }
  | { mode: "move"; pointerId: number }
  | {
      mode: "resize";
      pointerId: number;
      arrowEndpoint?: "start" | "end";
      arrowId?: string;
      binding?: ElementBinding;
    }
  | {
      mode: "rotate";
      pointerId: number;
      elementId: string;
      initialAngle: number;
      previousPointerAngle: number;
      accumulatedAngle: number;
      center: Point;
    }
  | null;

function normalizeRect(start: Point, end: Point): Rect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

function getPointerAngle(point: Point, center: Point) {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

export function useSelectElements() {
  const interactionRef = useRef<SelectionInteraction>(null);
  const move = useMoveElements();
  const resize = useResizeElements();

  function findTopElement(point: Point) {
    return [...sceneStore.get().elements]
      .reverse()
      .find((element) => !element.locked && hitTestElement(element, point));
  }

  function getArrowEndpointBinding(point: Point, arrowId: string) {
    const target = findArrowBindingTarget(
      sceneStore.get().elements,
      point,
      arrowId,
      ARROW_BINDING_RADIUS / viewportStore.get().zoom,
    );

    if (!target) {
      return undefined;
    }

    const binding = createArrowBinding(target, point);
    const anchorPoint = getArrowBindingAnchor(target, binding, point);

    return { anchorPoint, binding, targetId: target.id };
  }

  function updateSelectionCursor(
    event: ReactPointerEvent<HTMLCanvasElement>,
    point: Point,
  ) {
    const selection = selectionStore.get();
    const selectedElement =
      selection.elementIds.length === 1
        ? sceneStore
            .get()
            .elements.find(
              (element) => element.id === selection.elementIds[0] && !element.locked,
            )
        : undefined;

    if (!selectedElement) {
      event.currentTarget.style.cursor = "";
      return;
    }

    const zoom = viewportStore.get().zoom;
    const rotationHandle = getElementRotationHandle(selectedElement, 30 / zoom);

    if (
      Math.hypot(
        point.x - rotationHandle.point.x,
        point.y - rotationHandle.point.y,
      ) <=
      11 / zoom
    ) {
      event.currentTarget.style.cursor = "crosshair";
      return;
    }

    const handle = findResizeHandleAtPoint(selectedElement, point, 10 / zoom);
    event.currentTarget.style.cursor = handle ? (getResizeCursor(handle) ?? "") : "";
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (editingLockStore.get().isLocked || event.button !== 0) {
      return;
    }

    const point = getWorldPointerPosition(event);
    const selection = selectionStore.get();
    const selectedElement =
      selection.elementIds.length === 1
        ? sceneStore
            .get()
            .elements.find(
              (element) => element.id === selection.elementIds[0] && !element.locked,
            )
        : undefined;
    const zoom = viewportStore.get().zoom;

    if (selectedElement) {
      const rotationHandle = getElementRotationHandle(selectedElement, 30 / zoom);
      const isRotationHandle =
        Math.hypot(point.x - rotationHandle.point.x, point.y - rotationHandle.point.y) <=
        11 / zoom;

      if (isRotationHandle) {
        event.preventDefault();
        historyStore.begin();
        event.currentTarget.setPointerCapture(event.pointerId);
        const center = getElementCenter(selectedElement);
        interactionRef.current = {
          mode: "rotate",
          pointerId: event.pointerId,
          elementId: selectedElement.id,
          initialAngle: getElementRotation(selectedElement),
          previousPointerAngle: getPointerAngle(point, center),
          accumulatedAngle: 0,
          center,
        };
        return;
      }
    }

    const handle = selectedElement
      ? findResizeHandleAtPoint(selectedElement, point, 10 / zoom)
      : null;

    if (selectedElement && handle) {
      historyStore.begin();
      event.currentTarget.setPointerCapture(event.pointerId);
      resize.startResize(selectedElement.id, handle, point);
      arrowBindingIndicatorStore.clear();
      interactionRef.current = {
        mode: "resize",
        pointerId: event.pointerId,
        ...(selectedElement.type === "arrow" && (handle === "start" || handle === "end")
          ? { arrowEndpoint: handle, arrowId: selectedElement.id }
          : {}),
      };
      return;
    }

    const hitElement = findTopElement(point);

    if (hitElement) {
      if ((event.ctrlKey || event.metaKey) && hitElement.link) {
        event.preventDefault();
        window.open(hitElement.link, "_blank", "noopener,noreferrer");
        return;
      }

      const isAlreadySelected = selection.elementIds.includes(hitElement.id);
      const groupIds = hitElement.groupId
        ? sceneStore
            .get()
            .elements.filter((element) => element.groupId === hitElement.groupId && !element.locked)
            .map((element) => element.id)
        : [hitElement.id];

      if (event.shiftKey || !isAlreadySelected) {
        selectionStore.setElementIds(
          event.shiftKey
            ? [...selectionStore.get().elementIds, ...groupIds]
            : groupIds,
        );
      }

      const elementIds = selectionStore.get().elementIds;

      if (!event.shiftKey && elementIds.length > 0) {
        historyStore.begin();
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
    const point = getWorldPointerPosition(event);

    if (!interaction || interaction.pointerId !== event.pointerId) {
      updateSelectionCursor(event, point);
      return;
    }

    if (interaction.mode === "rotate") {
      const pointerAngle = getPointerAngle(point, interaction.center);
      const delta = normalizeAngleDelta(pointerAngle - interaction.previousPointerAngle);
      interaction.previousPointerAngle = pointerAngle;
      interaction.accumulatedAngle += delta;

      const nextAngle = interaction.initialAngle + interaction.accumulatedAngle;
      const shouldSnapRotation = event.shiftKey || event.ctrlKey || event.metaKey;

      sceneStore.updateById(interaction.elementId, (element) =>
        updateElement(element, {
          angle: shouldSnapRotation
            ? snapRotationAngle(nextAngle, ROTATION_SNAP_ANGLE)
            : nextAngle,
        }),
      );
      return;
    }

    if (interaction.mode === "resize") {
      let resizePoint = point;

      if (interaction.arrowEndpoint && interaction.arrowId) {
        const candidate = getArrowEndpointBinding(point, interaction.arrowId);

        if (candidate) {
          resizePoint = candidate.anchorPoint;
          interaction.binding = candidate.binding;
          arrowBindingIndicatorStore.set({
            targetId: candidate.targetId,
            anchorPoint: candidate.anchorPoint,
          });
        } else {
          interaction.binding = undefined;
          arrowBindingIndicatorStore.clear();
        }
      }

      resize.updateResize(resizePoint, {
        snapToGrid: event.ctrlKey || event.metaKey,
        keepAspectRatio: event.shiftKey,
        resizeFromCenter: event.altKey,
      });
      return;
    }

    if (interaction.mode === "move") {
      move.updateMove(point, {
        alignToElements: event.ctrlKey || event.metaKey,
        constrainToAxis: event.shiftKey,
        zoom: viewportStore.get().zoom,
      });
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
        selectByArea(selectionBox, interaction.append);
      }
    }

    if (
      interaction.mode === "resize" &&
      interaction.arrowEndpoint &&
      interaction.arrowId &&
      interaction.binding
    ) {
      sceneStore.updateById(interaction.arrowId, (element) =>
        element.type === "arrow"
          ? updateElement(element, {
              ...(interaction.arrowEndpoint === "start"
                ? { startBinding: interaction.binding }
                : { endBinding: interaction.binding }),
            })
          : element,
      );
    }

    const finishedMove = move.finishMove();
    const finishedResize = resize.finishResize();
    arrowBindingIndicatorStore.clear();

    if (
      finishedMove ||
      finishedResize ||
      interaction.mode === "rotate"
    ) {
      historyStore.commit();
    }
    interactionRef.current = null;
    selectionStore.setSelectionBox(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function onDoubleClick(event: ReactMouseEvent<HTMLCanvasElement>) {
    if (editingLockStore.get().isLocked) {
      return;
    }

    const hitElement = findTopElement(getWorldPointerPosition(event));
    if (hitElement?.type === "text" || hitElement?.type === "sticky" || hitElement?.type === "callout") {
      selectionStore.setElementIds([hitElement.id]);
      historyStore.begin();
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
