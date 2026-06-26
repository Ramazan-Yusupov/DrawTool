import { useRef } from "react";
import { viewportStore } from "@/entities/viewport";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";
import type { Point } from "@/shared/types";

type PanState = {
  pointerId: number;
  startPoint: Point;
  startViewport: ReturnType<typeof viewportStore.get>;
};

export function useCanvasPointerEvents() {
  const panStateRef = useRef<PanState | null>(null);

  function onPointerDown(
    event: React.PointerEvent<HTMLCanvasElement>,
    allowPrimaryButton = false,
  ) {
    const isMiddleButton = event.button === 1;
    const isPrimaryButton = allowPrimaryButton && event.button === 0;

    if (!isMiddleButton && !isPrimaryButton) {
      return;
    }

    event.preventDefault();

    panStateRef.current = {
      pointerId: event.pointerId,
      startPoint: getCanvasPointerPosition(
        event.nativeEvent,
        event.currentTarget,
      ),
      startViewport: viewportStore.get(),
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const panState = panStateRef.current;

    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }

    const currentPoint = getCanvasPointerPosition(
      event.nativeEvent,
      event.currentTarget,
    );

    const deltaX = currentPoint.x - panState.startPoint.x;
    const deltaY = currentPoint.y - panState.startPoint.y;

    viewportStore.set({
      ...panState.startViewport,
      x: panState.startViewport.x - deltaX / panState.startViewport.zoom,
      y: panState.startViewport.y - deltaY / panState.startViewport.zoom,
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const panState = panStateRef.current;

    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }

    panStateRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
