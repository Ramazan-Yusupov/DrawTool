export type ElementType = "rectangle";

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

export type BoardElement = RectangleElement;
