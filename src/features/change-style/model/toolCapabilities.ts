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

const SHAPE_CAPABILITIES: ToolStyleCapabilities = {
  stroke: true,
  fill: true,
  corner: false,
  opacity: true,
  snap: true,
  text: false,
  arrowRouting: false,
};

export const TOOL_SETTINGS_CAPABILITIES: Record<ToolId, ToolStyleCapabilities> = {
  pan: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  selection: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  rectangle: { ...SHAPE_CAPABILITIES, corner: true },
  ellipse: { ...SHAPE_CAPABILITIES },
  diamond: { ...SHAPE_CAPABILITIES },
  triangle: { ...SHAPE_CAPABILITIES },
  hexagon: { ...SHAPE_CAPABILITIES },
  star: { ...SHAPE_CAPABILITIES },
  cloud: { ...SHAPE_CAPABILITIES },
  frame: { ...SHAPE_CAPABILITIES, fill: false, corner: false },
  embed: { ...SHAPE_CAPABILITIES, corner: true },
  line: {
    ...SHAPE_CAPABILITIES,
    fill: false,
  },
  arrow: {
    ...SHAPE_CAPABILITIES,
    fill: false,
    arrowRouting: true,
  },
  freedraw: {
    ...SHAPE_CAPABILITIES,
    fill: false,
  },
  laser: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  code: { ...SHAPE_CAPABILITIES, corner: true, snap: false },
  image: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: true,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  lasso: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
  },
  eraser: {
    stroke: false,
    fill: false,
    corner: false,
    opacity: false,
    snap: false,
    text: false,
    arrowRouting: false,
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
