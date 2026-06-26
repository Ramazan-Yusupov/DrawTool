export type ShapeToolId =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon"
  | "star"
  | "cloud"
  | "line"
  | "arrow"
  | "frame"
  | "embed";

export type ToolId =
  | "pan"
  | "selection"
  | "text"
  | "freedraw"
  | "eraser"
  | "laser"
  | "lasso"
  | "code"
  | ShapeToolId;
