import {
  getArrowCurveControlPoint,
  getArrowPathPoints,
  getElementBounds,
} from "@/entities/element";
import type { BoardElement } from "@/entities/element";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
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

function textSvg(text: string, x: number, y: number, fontSize: number, color: string, maxWidth?: number) {
  const width = maxWidth ? ` textLength="${Math.max(1, maxWidth)}" lengthAdjust="spacingAndGlyphs"` : "";
  return text.split("\n").map((line, index) => `<text x="${x}" y="${y + fontSize + index * Math.round(fontSize * 1.25)}" fill="${color}" font-size="${fontSize}" font-family="Inter,Segoe UI,sans-serif"${width}>${escapeXml(line || " ")}</text>`).join("");
}

function elementToSvg(element: BoardElement) {
  const { x, y, width, height, style } = element;
  const bounds = getElementBounds(element);
  const common = `fill="${style.fillStyle === "solid" ? style.backgroundColor : "none"}" fill-opacity="${style.opacity}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}"`;
  let markup: string;

  if (element.type === "ellipse") {
    markup = `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${Math.abs(width) / 2}" ry="${Math.abs(height) / 2}" ${common} />`;
  } else if (element.type === "line" || element.type === "measure") {
    markup = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" ${common} />`;
    if (element.type === "measure") {
      const distance = Math.hypot(width, height).toFixed(1);
      markup += textSvg(`${distance} px`, x + width / 2 - 20, y + height / 2 - 8, 12, style.strokeColor);
    }
  } else if (element.type === "arrow") {
    if (element.routing === "curve") {
      const control = getArrowCurveControlPoint(element);
      markup = `<path d="M ${element.x} ${element.y} Q ${control.x} ${control.y} ${element.x + element.width} ${element.y + element.height}" fill="none" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" marker-end="url(#arrowhead)" />`;
    } else {
      const points = getArrowPathPoints(element).map((point) => `${point.x},${point.y}`).join(" ");
      markup = `<polyline points="${points}" fill="none" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" marker-end="url(#arrowhead)" />`;
    }
  } else if (element.type === "text") {
    markup = textSvg(element.text, x + 6, y + 4, element.fontSize, style.strokeColor);
  } else if (element.type === "sticky") {
    markup = `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="12" fill="${style.backgroundColor}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" />` + textSvg(element.text, bounds.x + 10, bounds.y + 8, element.fontSize, style.strokeColor);
  } else if (element.type === "callout") {
    const line = element.targetPoint ? `<line x1="${bounds.x + bounds.width / 2}" y1="${bounds.y + bounds.height / 2}" x2="${element.targetPoint.x}" y2="${element.targetPoint.y}" stroke="${style.strokeColor}" stroke-dasharray="5 4" />` : "";
    markup = `${line}<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="12" fill="${style.backgroundColor}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" />${textSvg(element.text, bounds.x + 10, bounds.y + 8, element.fontSize, "#f8fafc")}`;
  } else if (element.type === "table") {
    const cellWidth = bounds.width / element.columns;
    const cellHeight = bounds.height / element.rows;
    let grid = `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" rx="${style.cornerStyle === "rounded" ? 10 : 0}" ${common} />`;
    for (let c = 1; c < element.columns; c += 1) grid += `<line x1="${bounds.x + c * cellWidth}" y1="${bounds.y}" x2="${bounds.x + c * cellWidth}" y2="${bounds.y + bounds.height}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" />`;
    for (let r = 1; r < element.rows; r += 1) grid += `<line x1="${bounds.x}" y1="${bounds.y + r * cellHeight}" x2="${bounds.x + bounds.width}" y2="${bounds.y + r * cellHeight}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" />`;
    element.cells.forEach((cell, index) => { const r = Math.floor(index / element.columns); const c = index % element.columns; grid += textSvg(cell, bounds.x + c * cellWidth + 8, bounds.y + r * cellHeight + 8, 14, "#e2e8f0", cellWidth - 14); });
    markup = grid;
  } else if (element.type === "sticker") {
    markup = `<text x="${bounds.x + bounds.width / 2}" y="${bounds.y + bounds.height * 0.78}" text-anchor="middle" font-size="${element.fontSize}" opacity="${style.opacity}">${escapeXml(element.content)}</text>`;
  } else if (element.type === "freedraw" || element.type === "highlighter") {
    const points = element.points.map((point) => `${point.x},${point.y}`).join(" ");
    markup = `<polyline points="${points}" fill="none" stroke="${style.strokeColor}" stroke-opacity="${style.opacity}" stroke-linecap="round" stroke-linejoin="round" stroke-width="${style.strokeWidth}" />`;
  } else if (element.type === "image") {
    markup = `<image href="${escapeXml(element.src)}" x="${x}" y="${y}" width="${Math.abs(width)}" height="${Math.abs(height)}" opacity="${style.opacity}" preserveAspectRatio="none" />`;
  } else {
    markup = `<rect x="${x}" y="${y}" width="${Math.abs(width)}" height="${Math.abs(height)}" rx="${style.cornerStyle === "rounded" ? 12 : 0}" ${common} />`;
  }

  return element.link ? `<a href="${escapeXml(element.link)}" target="_blank">${markup}</a>` : markup;
}

/** Builds a portable SVG snapshot; specialized DrawTool elements retain their editable visual form. */
export function createSvgDocument(elements: BoardElement[], padding = 24) {
  const bounds = getSceneBounds(elements, padding);
  const content = elements.map(elementToSvg).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" /></marker></defs>${content}</svg>`;
}
