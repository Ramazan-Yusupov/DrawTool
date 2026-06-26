import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { sceneStore } from "@/entities/scene";
import { viewportStore } from "@/entities/viewport";
import { selectionStore } from "@/entities/selection";
import { textEditorStore } from "@/features/edit-text/model/textEditorStore";
import { themeStore } from "@/features/toggle-theme";
import { clearCanvas } from "@/shared/lib/canvas/clearCanvas";
import { prepareCanvas } from "@/shared/lib/canvas/prepareCanvas";
import type { CanvasSize } from "@/shared/lib/canvas/resizeCanvas";
import { renderGrid } from "../lib/renderGrid";
import { renderScene } from "../lib/renderScene";
import { useCanvasSize } from "./useCanvasSize";
import { renderSnapIndicator, snapIndicatorStore } from "@/features/draw-shape";
import { renderLaserPointer, laserPointerStore } from "@/features/laser-pointer";
import { renderLasso, lassoStore } from "@/features/lasso-select";
import {
  alignmentGuidesStore,
  renderAlignmentGuides,
} from "@/features/move-elements";

export function useBoardRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
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
    renderAlignmentGuides(context, viewport);
    renderLasso(context, viewport);
    renderLaserPointer(context, viewport);
    renderSnapIndicator(context, viewport);
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
    const unsubscribeViewport = viewportStore.subscribe(scheduleRender);
    const unsubscribeScene = sceneStore.subscribe(scheduleRender);
    const unsubscribeSelection = selectionStore.subscribe(scheduleRender);
    const unsubscribeTextEditor = textEditorStore.subscribe(scheduleRender);
    const unsubscribeTheme = themeStore.subscribe(scheduleRender);
    const unsubscribeSnapIndicator =
      snapIndicatorStore.subscribe(scheduleRender);
    const unsubscribeLaser = laserPointerStore.subscribe(scheduleRender);
    const unsubscribeLasso = lassoStore.subscribe(scheduleRender);
    const unsubscribeAlignmentGuides =
      alignmentGuidesStore.subscribe(scheduleRender);

    scheduleRender();

    return () => {
      unsubscribeViewport();
      unsubscribeScene();
      unsubscribeSelection();
      unsubscribeTextEditor();
      unsubscribeTheme();
      unsubscribeSnapIndicator();
      unsubscribeLaser();
      unsubscribeLasso();
      unsubscribeAlignmentGuides();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
    };
  }, [scheduleRender]);
}
