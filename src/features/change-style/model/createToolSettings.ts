import { DEFAULT_ELEMENT_STYLE } from "@/entities/element";
import { CANVAS_CONFIG } from "@/shared/config";
import type { ToolSettings } from "./types";

export function createToolSettings(): ToolSettings {
  return {
    style: { ...DEFAULT_ELEMENT_STYLE },
    snapToGrid: false,
    snapSize: CANVAS_CONFIG.defaultSnapSize,
    arrowRouting: "straight",
    fontSize: 24,
    fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
    textAlign: "left",
  };
}
