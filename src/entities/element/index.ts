export { DEFAULT_ELEMENT_STYLE } from "./model/constants";
export { createRectangle } from "./model/createElement";
export { updateElement } from "./model/updateElement";

export { getElementBounds } from "./lib/getElementBounds";
export { normalizeElement } from "./lib/normalizeElement";

export { renderElement } from "./render/renderElement";

export type {
  BaseElement,
  BoardElement,
  CornerStyle,
  ElementStyle,
  ElementType,
  FillStyle,
  RectangleElement,
  StrokeStyle,
} from "./model/types";
