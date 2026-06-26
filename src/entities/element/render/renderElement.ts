import { getElementCenter } from "../lib/getElementCenter";
import { getElementRotation } from "../lib/getElementRotation";
import type { BoardElement } from "../model/types";
import { renderArrow } from "./renderArrow";
import { renderCloud } from "./renderCloud";
import { renderDiamond } from "./renderDiamond";
import { renderEllipse } from "./renderEllipse";
import { renderEmbed } from "./renderEmbed";
import { renderFrame } from "./renderFrame";
import { renderFreeDraw } from "./renderFreeDraw";
import { renderHexagon } from "./renderHexagon";
import { renderLine } from "./renderLine";
import { renderRectangle } from "./renderRectangle";
import { renderStar } from "./renderStar";
import { renderText } from "./renderText";
import { renderTriangle } from "./renderTriangle";

function renderUnrotated(
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
    case "triangle":
      renderTriangle(context, element);
      return;
    case "hexagon":
      renderHexagon(context, element);
      return;
    case "star":
      renderStar(context, element);
      return;
    case "cloud":
      renderCloud(context, element);
      return;
    case "frame":
      renderFrame(context, element);
      return;
    case "embed":
      renderEmbed(context, element);
      return;
    case "line":
      renderLine(context, element);
      return;
    case "arrow":
      renderArrow(context, element);
      return;
    case "freedraw":
      renderFreeDraw(context, element);
      return;
    case "text":
      renderText(context, element);
      return;
  }
}

/** Renders every element around its own centre so rotation applies consistently. */
export function renderElement(
  context: CanvasRenderingContext2D,
  element: BoardElement,
) {
  const angle = getElementRotation(element);

  if (angle === 0) {
    renderUnrotated(context, element);
    return;
  }

  const center = getElementCenter(element);
  context.save();
  context.translate(center.x, center.y);
  context.rotate(angle);
  context.translate(-center.x, -center.y);
  renderUnrotated(context, element);
  context.restore();
}
