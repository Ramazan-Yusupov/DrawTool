import { useEffect, useRef, useSyncExternalStore } from "react";
import { Map } from "lucide-react";
import { getElementBounds, renderElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { viewportStore } from "@/entities/viewport";
import { cn } from "@/shared/lib";

const WIDTH = 180;
const HEIGHT = 120;
const PADDING = 16;

type SceneBounds = { x: number; y: number; width: number; height: number };

function getBounds(): SceneBounds {
  const elements = sceneStore.get().elements;
  if (elements.length === 0) {
    const viewport = viewportStore.get();
    return { x: viewport.x - 400, y: viewport.y - 260, width: 800, height: 520 };
  }
  const bounds = elements.map(getElementBounds);
  const left = Math.min(...bounds.map((item) => item.x));
  const top = Math.min(...bounds.map((item) => item.y));
  const right = Math.max(...bounds.map((item) => item.x + item.width));
  const bottom = Math.max(...bounds.map((item) => item.y + item.height));
  return { x: left - 120, y: top - 120, width: Math.max(320, right - left + 240), height: Math.max(220, bottom - top + 240) };
}

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
  useSyncExternalStore(viewportStore.subscribe, viewportStore.get, viewportStore.get);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, WIDTH, HEIGHT);
    const bounds = getBounds();
    const scale = Math.min((WIDTH - PADDING * 2) / bounds.width, (HEIGHT - PADDING * 2) / bounds.height);
    const contentWidth = bounds.width * scale;
    const contentHeight = bounds.height * scale;
    const offsetX = (WIDTH - contentWidth) / 2 - bounds.x * scale;
    const offsetY = (HEIGHT - contentHeight) / 2 - bounds.y * scale;

    context.save();
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);
    sceneStore.get().elements.forEach((element) => renderElement(context, element));
    context.restore();

    const viewport = viewportStore.get();
    const viewportWidth = window.innerWidth / viewport.zoom;
    const viewportHeight = window.innerHeight / viewport.zoom;
    context.save();
    context.strokeStyle = "#818cf8";
    context.fillStyle = "rgba(129, 140, 248, 0.12)";
    context.lineWidth = 1.5;
    context.strokeRect(offsetX + viewport.x * scale, offsetY + viewport.y * scale, viewportWidth * scale, viewportHeight * scale);
    context.fillRect(offsetX + viewport.x * scale, offsetY + viewport.y * scale, viewportWidth * scale, viewportHeight * scale);
    context.restore();
  }

  useEffect(() => {
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  });

  function moveViewport(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const bounds = getBounds();
    const scale = Math.min((WIDTH - PADDING * 2) / bounds.width, (HEIGHT - PADDING * 2) / bounds.height);
    const contentWidth = bounds.width * scale;
    const contentHeight = bounds.height * scale;
    const offsetX = (WIDTH - contentWidth) / 2 - bounds.x * scale;
    const offsetY = (HEIGHT - contentHeight) / 2 - bounds.y * scale;
    const viewport = viewportStore.get();
    viewportStore.set({
      ...viewport,
      x: (point.x - offsetX) / scale - window.innerWidth / viewport.zoom / 2,
      y: (point.y - offsetY) / scale - window.innerHeight / viewport.zoom / 2,
    });
  }

  return (
    <aside className="absolute bottom-4 left-4 z-20 hidden overflow-hidden rounded-xl border border-border bg-panel/95 shadow-panel backdrop-blur sm:block max-[1100px]:bottom-20">
      <div className="flex items-center gap-1.5 border-b border-border px-2 py-1 text-[10px] font-medium text-text-muted">
        <Map size={12} /> Миникарта
      </div>
      <canvas
        ref={canvasRef}
        aria-label="Миникарта холста"
        className={cn("block cursor-crosshair", "h-[120px] w-[180px]")}
        onPointerDown={moveViewport}
      />
    </aside>
  );
}
