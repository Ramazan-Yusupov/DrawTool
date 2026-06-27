import type { PointerEvent as ReactPointerEvent } from "react";
import { createSticker } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { toolLockStore } from "@/features/tool-lock";
import { getWorldPointerPosition } from "@/features/draw-shape/lib/getWorldPointerPosition";
import { stickerSettingsStore } from "./stickerSettingsStore";

export function useStickerTool() {
  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.button !== 0 || toolStore.get() !== "sticker") return;
    const point = getWorldPointerPosition(event);
    const { content } = stickerSettingsStore.get();
    historyStore.begin();
    const element = createSticker({ x: point.x - 24, y: point.y - 24, content });
    sceneStore.add(element);
    selectionStore.setElementIds([element.id]);
    historyStore.commit();
    if (!toolLockStore.get()) toolStore.set("selection");
  }
  return { onPointerDown };
}
