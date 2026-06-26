import type { PointerEvent as ReactPointerEvent } from "react";
import { screenToWorld, viewportStore } from "@/entities/viewport";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";

export function getWorldPointerPosition(
  event: ReactPointerEvent<HTMLCanvasElement>,
) {
  const screenPoint = getCanvasPointerPosition(
    event.nativeEvent,
    event.currentTarget,
  );

  return screenToWorld(screenPoint, viewportStore.get());
}
