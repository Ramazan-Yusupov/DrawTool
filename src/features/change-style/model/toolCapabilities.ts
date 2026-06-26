import type { ToolId } from "@/entities/tool";

export type ToolStyleCapabilities = {
  stroke: boolean;
  fill: boolean;
  corner: boolean;
  opacity: boolean;
  snap: boolean;
  text: boolean;
  arrowRouting: boolean;
};

export const TOOL_SETTINGS_CAPABILITIES: Record<ToolId, ToolStyleCapabilities> = {
  selection: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  rectangle: {
    stroke: true,
    fill: true,
    corner: true,
    opacity: true,
    snap: true,
    text: false,
    arrowRouting: false,
  },
  ellipse: {
    stroke: true,
    fill: true,
    corner: false,
    opacity: true,
    snap: true,
    text: false,
    arrowRouting: false,
  },
  diamond: {
    stroke: true,
    fill: true,
    corner: false,
    opacity: true,
    snap: true,
    text: false,
    arrowRouting: false,
  },
  line: {
    stroke: true,
    fill: false,
    corner: false,
    opacity: true,
    snap: true,
    text: false,
    arrowRouting: false,
  },
  arrow: {
    stroke: true,
    fill: false,
    corner: false,
    opacity: true,
    snap: true,
    text: false,
    arrowRouting: true,
  },
  text: {
    stroke: true,
    fill: false,
    corner: false,
    opacity: true,
    snap: true,
    text: true,
    arrowRouting: false,
  },
};
