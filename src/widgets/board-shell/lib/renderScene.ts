import {
  getElementBounds,
  renderElement,
} from "@/entities/element";
import type { BoardElement, FrameElement } from "@/entities/element";
import { getFrameContentBounds } from "@/entities/scene";
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

/**
 * Frames are containers. Their direct descendants are clipped to the inner
 * rectangle, so moving/resizing a Frame cannot reveal content outside it.
 */
function renderFrameChildren(
  context: CanvasRenderingContext2D,
  frame: FrameElement,
  childrenByParentId: Map<string, BoardElement[]>,
  visibleBounds: ReturnType<typeof getVisibleBounds>,
  renderTextPass: boolean,
  editingTextId: string | null,
) {
  const children = childrenByParentId.get(frame.id) ?? [];
  const content = getFrameContentBounds(frame);

  context.save();
  // Axis-aligned clipping remains intentionally predictable while Frame
  // rotation is edited. Rotated Frame rendering still works; the clip simply
  // follows the unrotated logical content box for now.
  context.beginPath();
  context.rect(content.x, content.y, content.width, content.height);
  context.clip();

  children.forEach((child) => {
    if (child.id === editingTextId) return;
    if (!isVisible(getElementBounds(child), visibleBounds)) return;

    if (child.type === "frame") {
      if (!renderTextPass) {
        renderElement(context, child);
        renderFrameChildren(
          context,
          child,
          childrenByParentId,
          visibleBounds,
          renderTextPass,
          editingTextId,
        );
      } else {
        renderFrameChildren(
          context,
          child,
          childrenByParentId,
          visibleBounds,
          renderTextPass,
          editingTextId,
        );
      }
      return;
    }

    if (
      (child.type === "text") === renderTextPass &&
      child.id !== editingTextId
    ) {
      renderElement(context, child);
    }
  });

  context.restore();
}

export function renderScene({ context, viewport, size }: RenderSceneParams) {
  const visibleBounds = getVisibleBounds(viewport, size);
  const { elements } = sceneStore.get();
  const editingTextId = textEditorStore.get().elementId;
  const ids = new Set(elements.map((element) => element.id));
  const childrenByParentId = new Map<string, BoardElement[]>();

  elements.forEach((element) => {
    if (element.parentId && ids.has(element.parentId)) {
      const children = childrenByParentId.get(element.parentId) ?? [];
      children.push(element);
      childrenByParentId.set(element.parentId, children);
    }
  });

  const rootElements = elements.filter(
    (element) => !element.parentId || !ids.has(element.parentId),
  );

  context.save();
  context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom);
  context.scale(viewport.zoom, viewport.zoom);

  // First pass: all shapes and frame containers.
  rootElements.forEach((element) => {
    if (!isVisible(getElementBounds(element), visibleBounds)) return;
    if (element.id === editingTextId) return;
    if (element.type === "text") return;

    renderElement(context, element);

    if (element.type === "frame") {
      renderFrameChildren(
        context,
        element,
        childrenByParentId,
        visibleBounds,
        false,
        editingTextId,
      );
    }
  });

  // Second pass: text stays above every regular shape, including Frame content.
  rootElements.forEach((element) => {
    if (!isVisible(getElementBounds(element), visibleBounds)) return;

    if (element.type === "text") {
      if (element.id !== editingTextId) renderElement(context, element);
      return;
    }

    if (element.type === "frame") {
      renderFrameChildren(
        context,
        element,
        childrenByParentId,
        visibleBounds,
        true,
        editingTextId,
      );
    }
  });

  context.restore();
  renderSelection(context, viewport);
}
