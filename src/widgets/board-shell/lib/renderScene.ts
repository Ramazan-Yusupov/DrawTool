import { getElementBounds, renderElement } from "@/entities/element";
import { getVisibleBounds, worldToScreen } from "@/entities/viewport";
import { sceneStore } from "@/entities/scene";
import { textEditorStore } from "@/features/edit-text/model/textEditorStore";
import { renderSelection } from "./renderSelection";
import type { Viewport } from "@/entities/viewport";
import type { CanvasSize } from "@/shared/lib/canvas/resizeCanvas";

type RenderSceneParams = {
  context: CanvasRenderingContext2D;
  viewport: Viewport;
  size: CanvasSize;
};

function isVisible(
  elementBounds: ReturnType<typeof getElementBounds>,
  visibleBounds: ReturnType<typeof getVisibleBounds>,
) {
  return !(
    elementBounds.x > visibleBounds.x + visibleBounds.width ||
    elementBounds.x + elementBounds.width < visibleBounds.x ||
    elementBounds.y > visibleBounds.y + visibleBounds.height ||
    elementBounds.y + elementBounds.height < visibleBounds.y
  );
}

function renderWorldOrigin(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
  size: CanvasSize,
) {
  const origin = worldToScreen({ x: 0, y: 0 }, viewport);

  context.save();
  context.strokeStyle = "rgb(37 99 235 / 45%)";
  context.lineWidth = 1;

  context.beginPath();

  if (origin.x >= 0 && origin.x <= size.width) {
    context.moveTo(origin.x + 0.5, 0);
    context.lineTo(origin.x + 0.5, size.height);
  }

  if (origin.y >= 0 && origin.y <= size.height) {
    context.moveTo(0, origin.y + 0.5);
    context.lineTo(size.width, origin.y + 0.5);
  }

  context.stroke();
  context.restore();
}

export function renderScene({ context, viewport, size }: RenderSceneParams) {
  const visibleBounds = getVisibleBounds(viewport, size);
  const { elements } = sceneStore.get();
  const editingTextId = textEditorStore.get().elementId;

  renderWorldOrigin(context, viewport, size);

  context.save();
  context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom);
  context.scale(viewport.zoom, viewport.zoom);

  elements.forEach((element) => {
    const isEditedText = element.type === "text" && element.id === editingTextId;

    if (!isEditedText && isVisible(getElementBounds(element), visibleBounds)) {
      renderElement(context, element);
    }
  });

  context.restore();
  renderSelection(context, viewport);
}
