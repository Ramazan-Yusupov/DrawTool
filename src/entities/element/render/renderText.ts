import type { TextElement } from "../model/types";

export function renderText(
  context: CanvasRenderingContext2D,
  element: TextElement,
) {
  const { style } = element;
  const lineHeight = Math.round(element.fontSize * 1.25);

  context.save();
  context.globalAlpha = style.opacity;
  context.fillStyle = style.strokeColor;
  context.font = `${element.fontSize}px ${element.fontFamily}`;
  context.textBaseline = "top";
  context.textAlign = element.textAlign;

  const anchorX =
    element.textAlign === "center"
      ? element.x + element.width / 2
      : element.textAlign === "right"
        ? element.x + element.width
        : element.x;

  element.text.split("\n").forEach((line, index) => {
    context.fillText(line || " ", anchorX, element.y + index * lineHeight);
  });

  context.restore();
}
