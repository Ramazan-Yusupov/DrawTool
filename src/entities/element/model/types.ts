export type ElementType = "rectangle";

export type ElementStyle = {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
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
