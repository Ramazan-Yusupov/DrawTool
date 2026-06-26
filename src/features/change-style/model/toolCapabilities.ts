import type { ToolId } from "@/entities/tool";

export type ToolStyleCapabilities = {
  stroke: boolean;
  fill: boolean;
  corner: boolean;
  opacity: boolean;
  snap: boolean;
};

export const TOOL_SETTINGS_CAPABILITIES: Record<ToolId, ToolStyleCapabilities> =
  {
    selection: {
      stroke: false,
      fill: false,
      corner: false,
      opacity: false,
      snap: true,
    },

    rectangle: {
      stroke: true,
      fill: true,
      corner: true,
      opacity: true,
      snap: true,
    },
  };
