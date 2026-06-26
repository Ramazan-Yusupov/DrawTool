import type { Point } from "@/shared/types";

export type ElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon"
  | "star"
  | "cloud"
  | "line"
  | "arrow"
  | "freedraw"
  | "text"
  | "frame"
  | "embed";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle = "transparent" | "solid";
export type CornerStyle = "sharp" | "rounded";
export type ArrowRouting = "straight" | "elbow";
export type ElbowAxis = "horizontal" | "vertical";
export type TextAlign = "left" | "center" | "right";

export type ElementStyle = {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  cornerStyle: CornerStyle;
  opacity: number;
};

export type BaseElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Rotation in radians. It may exceed 2π while the user keeps rotating. */
  angle: number;
  createdAt: number;
  updatedAt: number;
  style: ElementStyle;
};

export type RectangleElement = BaseElement & { type: "rectangle" };
export type EllipseElement = BaseElement & { type: "ellipse" };
export type DiamondElement = BaseElement & { type: "diamond" };
export type TriangleElement = BaseElement & { type: "triangle" };
export type HexagonElement = BaseElement & { type: "hexagon" };
export type StarElement = BaseElement & { type: "star" };
export type CloudElement = BaseElement & { type: "cloud" };
export type LineElement = BaseElement & { type: "line" };

export type ArrowElement = BaseElement & {
  type: "arrow";
  routing: ArrowRouting;
  elbowAxis: ElbowAxis;
  elbowOffset: number;
};

export type FreeDrawElement = BaseElement & {
  type: "freedraw";
  points: Point[];
};

export type FrameElement = BaseElement & {
  type: "frame";
  name: string;
};

export type EmbedElement = BaseElement & {
  type: "embed";
  url: string;
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  textAlign: TextAlign;
};

export type BoardElement =
  | RectangleElement
  | EllipseElement
  | DiamondElement
  | TriangleElement
  | HexagonElement
  | StarElement
  | CloudElement
  | LineElement
  | ArrowElement
  | FreeDrawElement
  | TextElement
  | FrameElement
  | EmbedElement;

export type ElementEndpoints = {
  start: Point;
  end: Point;
};
