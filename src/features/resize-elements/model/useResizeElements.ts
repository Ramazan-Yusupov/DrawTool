import { useRef } from "react";
import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import type { Point } from "@/shared/types";
import { resizeElement } from "./resizeElements";
import type { ResizeHandle, ResizeModifiers } from "./types";

type ActiveResize = {
  elementId: string;
  handle: ResizeHandle;
  initialElement: BoardElement;
  startPoint: Point;
};

const DEFAULT_MODIFIERS: ResizeModifiers = {
  snapToGrid: false,
  keepAspectRatio: false,
  resizeFromCenter: false,
};

function cloneElementForResize(element: BoardElement): BoardElement {
  return {
    ...element,
    style: { ...element.style },
  };
}

export function useResizeElements() {
  const resizeRef = useRef<ActiveResize | null>(null);

  function startResize(
    elementId: string,
    handle: ResizeHandle,
    startPoint: Point,
  ) {
    const element = sceneStore
      .get()
      .elements.find((item) => item.id === elementId);

    if (!element) {
      resizeRef.current = null;
      return;
    }

    resizeRef.current = {
      elementId,
      handle,
      initialElement: cloneElementForResize(element),
      startPoint,
    };
  }

  function updateResize(
    point: Point,
    modifiers: ResizeModifiers = DEFAULT_MODIFIERS,
  ) {
    const activeResize = resizeRef.current;

    if (!activeResize) {
      return false;
    }

    resizeElement(
      activeResize.initialElement,
      activeResize.handle,
      activeResize.startPoint,
      point,
      modifiers,
    );

    return true;
  }

  function finishResize() {
    const hadResize = resizeRef.current !== null;
    resizeRef.current = null;
    return hadResize;
  }

  return { finishResize, startResize, updateResize };
}
