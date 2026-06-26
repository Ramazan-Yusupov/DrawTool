export type ElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "line"
  | "arrow";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type FillStyle = "transparent" | "solid";

export type CornerStyle = "sharp" | "rounded";

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
  createdAt: number;
  updatedAt: number;
  style: ElementStyle;
};

export type RectangleElement = BaseElement & {
  type: "rectangle";
};

export type EllipseElement = BaseElement & {
  type: "ellipse";
};

export type DiamondElement = BaseElement & {
  type: "diamond";
};

export type LineElement = BaseElement & {
  type: "line";
};

export type ArrowElement = BaseElement & {
  type: "arrow";
};

export type BoardElement =
  | RectangleElement
  | EllipseElement
  | DiamondElement
  | LineElement
  | ArrowElement;
