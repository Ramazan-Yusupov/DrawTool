import type { Viewport } from "@/entities/viewport";
import { laserPointerStore } from "../model/laserPointerStore";

export function renderLaserPointer(
  context: CanvasRenderingContext2D,
  viewport: Viewport,
) {
  const { points } = laserPointerStore.get();
  if (points.length === 0) {
    return;
  }

  context.save();
  context.translate(-viewport.x * viewport.zoom, -viewport.y * viewport.zoom);
  context.scale(viewport.zoom, viewport.zoom);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "rgb(248 113 113 / 88%)";
  context.shadowBlur = 12 / viewport.zoom;
  context.shadowColor = "rgb(248 113 113 / 85%)";
  context.lineWidth = 2.5 / viewport.zoom;

  if (points.length > 1) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
  }

  const end = points.at(-1);
  if (end) {
    context.fillStyle = "#f87171";
    context.beginPath();
    context.arc(end.x, end.y, 5 / viewport.zoom, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}
