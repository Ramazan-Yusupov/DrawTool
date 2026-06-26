import type { TextElement } from "../model/types";

const CHARACTER_WIDTH_RATIO = 0.62;
const LINE_HEIGHT_RATIO = 1.25;

export function getTextSize(
  text: string,
  fontSize: number,
): { width: number; height: number } {
  const lines = text.split("\n");
  const longestLine = lines.reduce(
    (longest, line) => Math.max(longest, line.length),
    1,
  );

  return {
    width: Math.max(fontSize, Math.ceil(longestLine * fontSize * CHARACTER_WIDTH_RATIO)),
    height: Math.max(fontSize, Math.ceil(lines.length * fontSize * LINE_HEIGHT_RATIO)),
  };
}

export function getTextElementSize(element: TextElement) {
  return getTextSize(element.text || " ", element.fontSize);
}
