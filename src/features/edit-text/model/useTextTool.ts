import type { PointerEvent as ReactPointerEvent } from "react";
import { createText, getTextSize } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolSettingsStore } from "@/features/change-style";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";
import { textEditorStore } from "./textEditorStore";

export function useTextTool() {
  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0) {
      return;
    }

    const settings = toolSettingsStore.get("text");
    const worldPoint = getWorldPointerPosition(event);
    const point = settings.snapToGrid
      ? snapPointToGrid(worldPoint, settings.snapSize)
      : worldPoint;
    const size = getTextSize(" ", settings.fontSize);
    const element = createText({
      x: point.x,
      y: point.y,
      width: size.width,
      height: size.height,
      style: settings.style,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textAlign: settings.textAlign,
    });

    sceneStore.add(element);
    selectionStore.setElementIds([element.id]);
    textEditorStore.open(element.id, true);
  }

  return { onPointerDown };
}
