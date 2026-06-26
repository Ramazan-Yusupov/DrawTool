import {
  getElementBounds,
  getElementCenter,
  getElementRotation,
} from "@/entities/element";
import { getSelectionBounds, getSelectedElements, selectionStore } from "@/entities/selection";
import { sceneStore } from "@/entities/scene";
import { editingLockStore } from "@/features/lock-editing";
import {
  getElementResizeHandles,
  getElementRotationHandle,
} from "@/features/resize-elements/lib/getResizeHandles";
import { rotatePoint } from "@/shared/lib";
import type { Viewport } from "@/entities/viewport";

const HANDLE_RADIUS = 5;
const ROTATION_HANDLE_RADIUS = 5;
const SELECTION_COLOR = "#818cf8";

function drawHandle(context: CanvasRenderingContext2D, x: number, y: number) {
  context.beginPath();
  context.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);
  context.fill();
  context.stroke();
}

function drawRotationHandle(
  context: CanvasRenderingContext2D,
  element: Parameters<typeof getElementRotationHandle>[0],
  viewport: Viewport,
) {
  const bounds = getElementBounds(element);
  const center = getElementCenter(element);
  const angle = getElementRotation(element);
  const topMiddle = rotatePoint(
    { x: bounds.x + bounds.width / 2, y: bounds.y },
    center,
    angle,
  );
  const handle = getElementRotationHandle(element, 30 / viewport.zoom);

  context.beginPath();
  context.moveTo(topMiddle.x, topMiddle.y);
  context.lineTo(handle.point.x, handle.point.y);
  context.stroke();

  context.beginPath();
  context.arc(
    handle.point.x,
    handle.point.y,
    ROTATION_HANDLE_RADIUS / viewport.zoom,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.stroke();
}

function drawRotatedSelectionOutline(
  context: CanvasRenderingContext2D,
  element: Parameters<typeof getElementResizeHandles>[0],
  viewport: Viewport,
) {
  const bounds = getElementBounds(element);
  const center = getElementCenter(element);
  const angle = getElementRotation(element);
  const inset = 4 / viewport.zoom;
  const corners = [
    { x: bounds.x - inset, y: bounds.y - inset },
    { x: bounds.x + bounds.width + inset, y: bounds.y - inset },
    {
      x: bounds.x + bounds.width + inset,
      y: bounds.y + bounds.height + inset,
    },
    { x: bounds.x - inset, y: bounds.y + bounds.height + inset },
  ].map((point) => rotatePoint(point, center, angle));

  context.beginPath();
  context.moveTo(corners[0].x, corners[0].y);
  corners.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();
  context.stroke();
}

export function renderSelection(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
) {
  if (editingLockStore.get().isLocked) {
    return;
  }

  const selection = selectionStore.get();
  const selectedElements = getSelectedElements(sceneStore.get().elements, selection);
  const bounds = getSelectionBounds(selectedElements);

  context.save();
  context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom);
  context.scale(viewport.zoom, viewport.zoom);
  context.lineWidth = 1.5 / viewport.zoom;
  context.strokeStyle = SELECTION_COLOR;
  context.fillStyle = "#ffffff";

  if (bounds) {
    context.setLineDash([5 / viewport.zoom, 4 / viewport.zoom]);

    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      drawRotatedSelectionOutline(context, element, viewport);
      context.setLineDash([]);
      getElementResizeHandles(element).forEach(({ point }) =>
        drawHandle(context, point.x, point.y),
      );
      drawRotationHandle(context, element, viewport);
    } else {
      const inset = 4 / viewport.zoom;
      context.strokeRect(
        bounds.x - inset,
        bounds.y - inset,
        bounds.width + inset * 2,
        bounds.height + inset * 2,
      );
      context.setLineDash([]);
    }
  }

  if (selection.selectionBox) {
    const { x, y, width, height } = selection.selectionBox;
    context.fillStyle = "rgb(129 140 248 / 10%)";
    context.strokeStyle = SELECTION_COLOR;
    context.setLineDash([4 / viewport.zoom, 3 / viewport.zoom]);
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }

  context.restore();
}
