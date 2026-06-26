import { useCallback, useEffect, useRef } from "react";
import { viewportStore } from "@/entities/viewport";
import { clearCanvas } from "@/shared/lib/canvas/clearCanvas";
import { prepareCanvas } from "@/shared/lib/canvas/prepareCanvas";
import type { CanvasSize } from "@/shared/lib/canvas/resizeCanvas";
import { renderGrid } from "../lib/renderGrid";
import { renderScene } from "../lib/renderScene";
import { useCanvasSize } from "./useCanvasSize";

export function useBoardRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef<CanvasSize | null>(null);

  const render = useCallback(() => {
    frameRef.current = null;

    const canvas = canvasRef.current;
    const size = sizeRef.current;

    if (!canvas || !size) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const viewport = viewportStore.get();

    clearCanvas(context);
    prepareCanvas(context, size.dpr);

    renderGrid({ context, viewport, size });
    renderScene({ context, viewport, size });
  }, [canvasRef]);

  const scheduleRender = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = requestAnimationFrame(render);
  }, [render]);

  useCanvasSize({
    canvasRef,
    onResize: (size) => {
      sizeRef.current = size;
      scheduleRender();
    },
  });

  useEffect(() => {
    const unsubscribe = viewportStore.subscribe(scheduleRender);

    scheduleRender();

    return () => {
      unsubscribe();

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scheduleRender]);
}
