import { worldToScreen } from "@/entities/viewport";
import type { Viewport } from "@/entities/viewport";
import type { CanvasSize } from "@/shared/lib/canvas/resizeCanvas";

type RenderSceneParams = {
  context: CanvasRenderingContext2D;
  viewport: Viewport;
  size: CanvasSize;
};

export function renderScene({ context, viewport, size }: RenderSceneParams) {
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
