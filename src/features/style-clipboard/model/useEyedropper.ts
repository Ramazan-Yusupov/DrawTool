import type { PointerEvent as ReactPointerEvent } from "react";
import { hitTestElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";
import { copyElementStyle } from "./styleClipboardActions";

export function useEyedropper() {
  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || toolStore.get() !== "eyedropper") return;
    const point = getWorldPointerPosition(event);
    const target = [...sceneStore.get().elements].reverse().find((element) => hitTestElement(element, point));
    if (!target) return;
    copyElementStyle(target);
    selectionStore.setElementIds([target.id]);
    toolStore.set("selection");
  }
  return { onPointerDown };
}
