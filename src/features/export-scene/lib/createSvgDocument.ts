import type { BoardElement } from "@/entities/element";
import { getElementBounds } from "@/entities/element";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

function getSceneBounds(elements: BoardElement[], padding: number) {
  if (elements.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const bounds = elements.map(getElementBounds);
  const left = Math.min(...bounds.map((item) => item.x)) - padding;
  const top = Math.min(...bounds.map((item) => item.y)) - padding;
  const right = Math.max(...bounds.map((item) => item.x + item.width)) + padding;
  const bottom = Math.max(...bounds.map((item) => item.y + item.height)) + padding;
  return { x: left, y: top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function elementToSvg(element: BoardElement) {
  const { x, y, width, height, style } = element;
  const common = `fill="${style.backgroundColor}" fill-opacity="${style.opacity}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}"`;

  if (element.type === "ellipse") {
    return `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${Math.abs(width) / 2}" ry="${Math.abs(height) / 2}" ${common} />`;
  }
  if (element.type === "line" || element.type === "arrow") {
    const marker = element.type === "arrow" ? ' marker-end="url(#arrowhead)"' : "";
    return `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" ${common}${marker} />`;
  }
  if (element.type === "text") {
    return `<text x="${x}" y="${y + element.fontSize}" fill="${style.strokeColor}" font-size="${element.fontSize}" text-anchor="${element.textAlign === "center" ? "middle" : element.textAlign === "right" ? "end" : "start"}">${escapeXml(element.text)}</text>`;
  }
  if (element.type === "freedraw") {
    const points = element.points.map((point) => `${point.x},${point.y}`).join(" ");
    return `<polyline points="${points}" fill="none" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" />`;
  }
  return `<rect x="${x}" y="${y}" width="${Math.abs(width)}" height="${Math.abs(height)}" rx="${style.cornerStyle === "rounded" ? 12 : 0}" ${common} />`;
}

/** Builds a portable SVG snapshot; unsupported custom shapes fall back to their bounds. */
export function createSvgDocument(elements: BoardElement[], padding = 24) {
  const bounds = getSceneBounds(elements, padding);
  const content = elements.map(elementToSvg).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="currentColor" /></marker></defs>${content}</svg>`;
}
