import type { MouseEvent as ReactMouseEvent } from "react";
import { hitTestElement } from "@/entities/element";
import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { screenToWorld, viewportStore } from "@/entities/viewport";
import { getCanvasPointerPosition } from "@/shared/lib/dom/getCanvasPointerPosition";

export function getContextMenuTarget(
  event: ReactMouseEvent<HTMLCanvasElement>,
) {
  const canvasPoint = getCanvasPointerPosition(
    event.nativeEvent,
    event.currentTarget,
  );
  const worldPoint = screenToWorld(canvasPoint, viewportStore.get());

  return [...sceneStore.get().elements]
    .reverse()
    .find((element) => hitTestElement(element, worldPoint));
}

export function getContextSelectionIds(target: BoardElement) {
  if (!target.groupId) {
    return [target.id];
  }

  return sceneStore
    .get()
    .elements.filter(
      (element) => element.groupId === target.groupId && !element.locked,
    )
    .map((element) => element.id);
}
