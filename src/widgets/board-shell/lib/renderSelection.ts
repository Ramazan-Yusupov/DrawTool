import { getSelectionBounds, getSelectedElements, selectionStore } from "@/entities/selection";
import { sceneStore } from "@/entities/scene";
import { getElementResizeHandles } from "@/features/resize-elements/lib/getResizeHandles";
import type { Viewport } from "@/entities/viewport";

const HANDLE_RADIUS = 5;
const SELECTION_COLOR = "#6366f1";

function drawHandle(context: CanvasRenderingContext2D, x: number, y: number) {
  context.beginPath();
  context.arc(x, y, HANDLE_RADIUS, 0, Math.PI * 2);
  context.fill();
  context.stroke();
}

export function renderSelection(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
) {
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
    const inset = 4 / viewport.zoom;
    context.setLineDash([5 / viewport.zoom, 4 / viewport.zoom]);
    context.strokeRect(
      bounds.x - inset,
      bounds.y - inset,
      bounds.width + inset * 2,
      bounds.height + inset * 2,
    );
    context.setLineDash([]);

    if (selectedElements.length === 1) {
      getElementResizeHandles(selectedElements[0]).forEach(({ point }) =>
        drawHandle(context, point.x, point.y),
      );
    }
  }

  if (selection.selectionBox) {
    const { x, y, width, height } = selection.selectionBox;
    context.fillStyle = "rgb(99 102 241 / 10%)";
    context.strokeStyle = SELECTION_COLOR;
    context.setLineDash([4 / viewport.zoom, 3 / viewport.zoom]);
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }

  context.restore();
}
