import { DEFAULT_ELEMENT_STYLE } from "@/entities/element";
import type { ToolSettings } from "./types";

export function createToolSettings(): ToolSettings {
  return {
    style: { ...DEFAULT_ELEMENT_STYLE },
    snapToGrid: false,
  };
}
