import type { BoardElement } from "../model/types";
import { renderRectangle } from "./renderRectangle";

export function renderElement(
  context: CanvasRenderingContext2D,
  element: BoardElement,
) {
  switch (element.type) {
    case "rectangle":
      renderRectangle(context, element);
      return;
  }
}
