import { getElementBounds, renderElement } from "@/entities/element";
import { getVisibleBounds } from "@/entities/viewport";
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

export function renderScene({ context, viewport, size }: RenderSceneParams) {
  const visibleBounds = getVisibleBounds(viewport, size);
  const { elements } = sceneStore.get();
  const editingTextId = textEditorStore.get().elementId;

  context.save();
  context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom);
  context.scale(viewport.zoom, viewport.zoom);

  const visibleElements = elements.filter((element) => {
    const isEditedText =
      element.type === "text" && element.id === editingTextId;

    return !isEditedText && isVisible(getElementBounds(element), visibleBounds);
  });

  visibleElements
    .filter((element) => element.type !== "text")
    .forEach((element) => {
      renderElement(context, element);
    });

  visibleElements
    .filter((element) => element.type === "text")
    .forEach((element) => {
      renderElement(context, element);
    });

  context.restore();
  renderSelection(context, viewport);
}
