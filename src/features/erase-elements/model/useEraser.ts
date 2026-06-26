import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { hitTestElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";

type EraserState = {
  pointerId: number;
  removedIds: Set<string>;
};

export function useEraser() {
  const eraserRef = useRef<EraserState | null>(null);

  function eraseAt(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getWorldPointerPosition(event);
    const hitElement = [...sceneStore.get().elements]
      .reverse()
      .find((element) => hitTestElement(element, point));

    if (!hitElement || eraserRef.current?.removedIds.has(hitElement.id)) {
      return;
    }

    eraserRef.current?.removedIds.add(hitElement.id);
    sceneStore.removeById(hitElement.id);
    selectionStore.setElementIds(
      selectionStore.get().elementIds.filter((id) => id !== hitElement.id),
    );
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) {
      return;
    }

    historyStore.begin();
    eraserRef.current = { pointerId: event.pointerId, removedIds: new Set() };
    eraseAt(event);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (eraserRef.current?.pointerId !== event.pointerId) {
      return;
    }

    eraseAt(event);
  }

  function finish(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (eraserRef.current?.pointerId !== event.pointerId) {
      return;
    }

    eraserRef.current = null;
    historyStore.commit();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    onPointerCancel: finish,
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
  };
}
