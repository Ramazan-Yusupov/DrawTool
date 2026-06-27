import { getElementBounds } from "../lib/getElementBounds";
import type { StickerElement } from "../model/types";

export function renderSticker(context: CanvasRenderingContext2D, element: StickerElement) {
  const bounds = getElementBounds(element);
  context.save();
  context.globalAlpha = element.style.opacity;
  context.font = `${element.fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(element.content, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, Math.max(bounds.width, bounds.height));
  context.restore();
}
