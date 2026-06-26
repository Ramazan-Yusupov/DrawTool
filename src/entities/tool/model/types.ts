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
  | "selection"
  | "text"
  | "freedraw"
  | "eraser"
  | "laser"
  | "lasso"
  | "code"
  | ShapeToolId;
