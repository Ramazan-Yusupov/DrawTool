import { DEFAULT_ELEMENT_STYLE } from "@/entities/element";
import { CANVAS_CONFIG } from "@/shared/config";
import type { ToolSettings } from "./types";

export function createToolSettings(): ToolSettings {
  return {
    style: { ...DEFAULT_ELEMENT_STYLE },
    snapToGrid: false,
    snapSize: CANVAS_CONFIG.defaultSnapSize,
  };
}
