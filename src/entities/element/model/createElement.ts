import { createId } from "@/shared/lib";
import { DEFAULT_ELEMENT_STYLE } from "./constants";
import type {
  ArrowElement,
  ArrowRouting,
  BoardElement,
  DiamondElement,
  ElementStyle,
  ElementType,
  EllipseElement,
  LineElement,
  RectangleElement,
  TextAlign,
  TextElement,
} from "./types";

type BaseCreateParams = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  style?: Partial<ElementStyle>;
};

type TextCreateParams = BaseCreateParams & {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: TextAlign;
};

type ArrowCreateParams = BaseCreateParams & {
  routing?: ArrowRouting;
};

function createBase<T extends BoardElement>(
  type: T["type"],
  params: BaseCreateParams,
): Omit<T, "type"> & { type: T["type"] } {
  const now = Date.now();

  return {
    id: createId(type),
    type,
    x: params.x,
    y: params.y,
    width: params.width ?? 0,
    height: params.height ?? 0,
    createdAt: now,
    updatedAt: now,
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      ...params.style,
    },
  } as Omit<T, "type"> & { type: T["type"] };
}

export function createRectangle(params: BaseCreateParams): RectangleElement {
  return createBase<RectangleElement>("rectangle", params);
}

export function createEllipse(params: BaseCreateParams): EllipseElement {
  return createBase<EllipseElement>("ellipse", params);
}

export function createDiamond(params: BaseCreateParams): DiamondElement {
  return createBase<DiamondElement>("diamond", params);
}

export function createLine(params: BaseCreateParams): LineElement {
  return createBase<LineElement>("line", params);
}

export function createArrow(params: ArrowCreateParams): ArrowElement {
  return {
    ...createBase<ArrowElement>("arrow", params),
    routing: params.routing ?? "elbow",
    elbowAxis: "horizontal",
    elbowOffset: 0.5,
  };
}

export function createText(params: TextCreateParams): TextElement {
  return {
    ...createBase<TextElement>("text", params),
    text: params.text ?? "",
    fontSize: params.fontSize ?? 24,
    fontFamily:
      params.fontFamily ?? '"Segoe Print", "Comic Sans MS", cursive',
    textAlign: params.textAlign ?? "left",
  };
}

export function createElement(
  type: ElementType,
  params: BaseCreateParams & TextCreateParams & ArrowCreateParams,
): BoardElement {
  switch (type) {
    case "rectangle":
      return createRectangle(params);
    case "ellipse":
      return createEllipse(params);
    case "diamond":
      return createDiamond(params);
    case "line":
      return createLine(params);
    case "arrow":
      return createArrow(params);
    case "text":
      return createText(params);
  }
}
