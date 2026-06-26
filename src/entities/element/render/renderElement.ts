import type { BoardElement } from "../model/types";
import { renderArrow } from "./renderArrow";
import { renderDiamond } from "./renderDiamond";
import { renderEllipse } from "./renderEllipse";
import { renderLine } from "./renderLine";
import { renderRectangle } from "./renderRectangle";
import { renderText } from "./renderText";

export function renderElement(
  context: CanvasRenderingContext2D,
  element: BoardElement,
) {
  switch (element.type) {
    case "rectangle":
      renderRectangle(context, element);
      return;
    case "ellipse":
      renderEllipse(context, element);
      return;
    case "diamond":
      renderDiamond(context, element);
      return;
    case "line":
      renderLine(context, element);
      return;
    case "arrow":
      renderArrow(context, element);
      return;
    case "text":
      renderText(context, element);
      return;
  }
}
