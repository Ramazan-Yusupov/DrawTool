import { imageFileStore } from "@/entities/image-file";
import type { ImageElement } from "../model/types";
import { renderImage } from "./renderImage";

function renderImagePlaceholder(
  context: CanvasRenderingContext2D,
  element: ImageElement,
) {
  context.save();
  context.globalAlpha *= Math.max(0.35, element.style.opacity);
  context.strokeStyle = element.style.strokeColor;
  context.lineWidth = Math.max(1, element.style.strokeWidth);
  context.setLineDash([6, 4]);
  context.strokeRect(element.x, element.y, element.width, element.height);
  context.restore();
}

/** Resolves a persisted image source through the image cache before drawing it. */
export function renderImageElement(
  context: CanvasRenderingContext2D,
  element: ImageElement,
) {
  const image = imageFileStore.getLoadedImage(element.fileId, element.src);

  if (!image) {
    renderImagePlaceholder(context, element);
    return;
  }

  renderImage(context, {
    image,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    opacity: element.style.opacity,
  });
}
