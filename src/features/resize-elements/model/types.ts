import type { Point, Rect } from "@/shared/types";

export type ResizeHandle =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "start"
  | "end"
  | "elbow"
  | "curve"
  | "rotate";

export type ResizeHandlePoint = {
  handle: ResizeHandle;
  point: Point;
};

export type ResizeModifiers = {
  snapToGrid: boolean;
  keepAspectRatio: boolean;
  resizeFromCenter: boolean;
};

export type ResizeState = {
  elementId: string;
  handle: ResizeHandle;
  startPoint: Point;
  startBounds: Rect;
};
