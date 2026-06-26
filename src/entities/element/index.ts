export { DEFAULT_ELEMENT_STYLE } from "./model/constants";
export {
  createArrow,
  createDiamond,
  createElement,
  createEllipse,
  createLine,
  createRectangle,
} from "./model/createElement";
export { updateElement } from "./model/updateElement";

export { getElementBounds } from "./lib/getElementBounds";
export { normalizeElement } from "./lib/normalizeElement";

export { renderElement } from "./render/renderElement";

export type {
  ArrowElement,
  BaseElement,
  BoardElement,
  CornerStyle,
  DiamondElement,
  ElementStyle,
  ElementType,
  EllipseElement,
  FillStyle,
  LineElement,
  RectangleElement,
  StrokeStyle,
} from "./model/types";
