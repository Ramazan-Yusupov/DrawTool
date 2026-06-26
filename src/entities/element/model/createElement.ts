import { createId } from "@/shared/lib";
import { DEFAULT_ELEMENT_STYLE } from "./constants";
import type {
  ArrowElement,
  BoardElement,
  DiamondElement,
  ElementType,
  EllipseElement,
  LineElement,
  RectangleElement,
} from "./types";

type CreateElementParams = Pick<BoardElement, "x" | "y" | "width" | "height"> &
  Partial<Pick<BoardElement, "style">>;

function createShape<T extends BoardElement>(
  type: T["type"],
  params: CreateElementParams,
): T {
  const now = Date.now();

  return {
    id: createId(type),
    type,
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    createdAt: now,
    updatedAt: now,
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      ...params.style,
    },
  } as T;
}

export function createRectangle(params: CreateElementParams): RectangleElement {
  return createShape<RectangleElement>("rectangle", params);
}

export function createEllipse(params: CreateElementParams): EllipseElement {
  return createShape<EllipseElement>("ellipse", params);
}

export function createDiamond(params: CreateElementParams): DiamondElement {
  return createShape<DiamondElement>("diamond", params);
}

export function createLine(params: CreateElementParams): LineElement {
  return createShape<LineElement>("line", params);
}

export function createArrow(params: CreateElementParams): ArrowElement {
  return createShape<ArrowElement>("arrow", params);
}

export function createElement(
  type: ElementType,
  params: CreateElementParams,
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
  }
}
