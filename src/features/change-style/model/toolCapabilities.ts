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

    ellipse: {
      stroke: true,
      fill: true,
      corner: false,
      opacity: true,
      snap: true,
    },

    diamond: {
      stroke: true,
      fill: true,
      corner: false,
      opacity: true,
      snap: true,
    },

    line: {
      stroke: true,
      fill: false,
      corner: false,
      opacity: true,
      snap: true,
    },

    arrow: {
      stroke: true,
      fill: false,
      corner: false,
      opacity: true,
      snap: true,
    },
  };
