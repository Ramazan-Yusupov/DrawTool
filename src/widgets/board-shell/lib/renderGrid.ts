import type { Viewport } from "@/entities/viewport";
import { CANVAS_CONFIG } from "@/shared/config";
import type { CanvasSize } from "@/shared/lib/canvas/resizeCanvas";

type RenderGridParams = {
  context: CanvasRenderingContext2D;
  viewport: Viewport;
  size: CanvasSize;
};

function getGridStep(zoom: number) {
  const minPixelDistance = 16;
  const baseStep = CANVAS_CONFIG.gridSize;
  const multiplier = Math.max(
    1,
    Math.ceil(minPixelDistance / (baseStep * zoom)),
  );

  return baseStep * multiplier;
}

function getOffset(position: number, step: number) {
  return -((position % step) + step) % step;
}

export function renderGrid({ context, viewport, size }: RenderGridParams) {
  const worldStep = getGridStep(viewport.zoom);
  const screenStep = worldStep * viewport.zoom;

  const startX = getOffset(viewport.x * viewport.zoom, screenStep);
  const startY = getOffset(viewport.y * viewport.zoom, screenStep);

  context.save();

  context.strokeStyle = "rgb(148 163 184 / 22%)";
  context.lineWidth = 1;

  context.beginPath();

  for (let x = startX; x <= size.width; x += screenStep) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, size.height);
  }

  for (let y = startY; y <= size.height; y += screenStep) {
    context.moveTo(0, y + 0.5);
    context.lineTo(size.width, y + 0.5);
  }

  context.stroke();
  context.restore();
}
