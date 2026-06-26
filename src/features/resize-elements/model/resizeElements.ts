import { getTextSize, updateElement } from "@/entities/element";
import type { BoardElement, TextElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { CANVAS_CONFIG } from "@/shared/config";
import { clamp } from "@/shared/lib";
import { snapPointToGrid } from "@/shared/lib/math/snapPointToGrid";
import type { Point } from "@/shared/types";
import { calculateResize } from "../lib/calculateResize";
import type { ResizeHandle, ResizeModifiers } from "./types";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 256;

type GeometryPatch = Partial<Pick<BoardElement, "x" | "y" | "width" | "height">>;

function getGeometry(element: BoardElement, patch: GeometryPatch) {
  return {
    x: patch.x ?? element.x,
    y: patch.y ?? element.y,
    width: patch.width ?? element.width,
    height: patch.height ?? element.height,
  };
}

function snapShapePatch(
  element: BoardElement,
  handle: ResizeHandle,
  patch: GeometryPatch,
): GeometryPatch {
  const geometry = getGeometry(element, patch);
  const originalRight = element.x + element.width;
  const originalBottom = element.y + element.height;
  const next = { ...geometry };

  if (handle.includes("e")) {
    next.width = Math.max(
      8,
      snapPointToGrid({ x: geometry.x + geometry.width, y: 0 }, CANVAS_CONFIG.defaultSnapSize).x -
        geometry.x,
    );
  }

  if (handle.includes("s")) {
    next.height = Math.max(
      8,
      snapPointToGrid({ x: 0, y: geometry.y + geometry.height }, CANVAS_CONFIG.defaultSnapSize).y -
        geometry.y,
    );
  }

  if (handle.includes("w")) {
    next.x = snapPointToGrid({ x: geometry.x, y: 0 }, CANVAS_CONFIG.defaultSnapSize).x;
    next.width = Math.max(8, originalRight - next.x);
  }

  if (handle.includes("n")) {
    next.y = snapPointToGrid({ x: 0, y: geometry.y }, CANVAS_CONFIG.defaultSnapSize).y;
    next.height = Math.max(8, originalBottom - next.y);
  }

  return next;
}

function snapConnectorPatch(
  element: BoardElement,
  handle: ResizeHandle,
  patch: GeometryPatch,
): GeometryPatch {
  const geometry = getGeometry(element, patch);
  const start = { x: geometry.x, y: geometry.y };
  const end = { x: geometry.x + geometry.width, y: geometry.y + geometry.height };

  if (handle === "start") {
    const snappedStart = snapPointToGrid(start, CANVAS_CONFIG.defaultSnapSize);
    return {
      x: snappedStart.x,
      y: snappedStart.y,
      width: end.x - snappedStart.x,
      height: end.y - snappedStart.y,
    };
  }

  if (handle === "end") {
    const snappedEnd = snapPointToGrid(end, CANVAS_CONFIG.defaultSnapSize);
    return {
      x: start.x,
      y: start.y,
      width: snappedEnd.x - start.x,
      height: snappedEnd.y - start.y,
    };
  }

  return patch;
}

function resizeTextElement(
  element: TextElement,
  handle: ResizeHandle,
  patch: GeometryPatch,
  modifiers: ResizeModifiers,
): GeometryPatch & Pick<TextElement, "fontSize"> {
  const geometry = getGeometry(element, patch);
  const initialSize = getTextSize(element.text || " ", element.fontSize, element.fontFamily);
  const initialWidth = Math.max(element.width, initialSize.width);
  const initialHeight = Math.max(element.height, initialSize.height);
  const changesHorizontal = handle.includes("e") || handle.includes("w");
  const changesVertical = handle.includes("n") || handle.includes("s");
  const horizontalScale = geometry.width / Math.max(initialWidth, 1);
  const verticalScale = geometry.height / Math.max(initialHeight, 1);
  const scale = changesHorizontal && changesVertical
    ? Math.max(horizontalScale, verticalScale)
    : changesHorizontal
      ? horizontalScale
      : verticalScale;
  const fontSize = clamp(
    Math.round(element.fontSize * Math.max(scale, 0.05) * 10) / 10,
    MIN_FONT_SIZE,
    MAX_FONT_SIZE,
  );
  const size = getTextSize(element.text || " ", fontSize, element.fontFamily);
  const originalRight = element.x + initialWidth;
  const originalBottom = element.y + initialHeight;
  const centerX = element.x + initialWidth / 2;
  const centerY = element.y + initialHeight / 2;

  let x = changesHorizontal
    ? handle.includes("w")
      ? originalRight - size.width
      : element.x
    : centerX - size.width / 2;
  let y = changesVertical
    ? handle.includes("n")
      ? originalBottom - size.height
      : element.y
    : centerY - size.height / 2;

  if (modifiers.resizeFromCenter) {
    x = centerX - size.width / 2;
    y = centerY - size.height / 2;
  }

  return { x, y, width: size.width, height: size.height, fontSize };
}

export function resizeElement(
  element: BoardElement,
  handle: ResizeHandle,
  startPoint: Point,
  currentPoint: Point,
  modifiers: ResizeModifiers,
) {
  if (element.type === "arrow" && handle === "elbow") {
    const point = modifiers.snapToGrid
      ? snapPointToGrid(currentPoint, CANVAS_CONFIG.defaultSnapSize)
      : currentPoint;
    const nextOffset =
      element.elbowAxis === "horizontal"
        ? (point.x - element.x) / (element.width || 1)
        : (point.y - element.y) / (element.height || 1);

    sceneStore.updateById(element.id, (current) =>
      current.type === "arrow"
        ? updateElement(current, { elbowOffset: clamp(nextOffset, 0.05, 0.95) })
        : current,
    );
    return;
  }

  const rawPatch = calculateResize(
    element,
    handle,
    startPoint,
    currentPoint,
    modifiers,
  );
  const patch = modifiers.snapToGrid
    ? element.type === "line" || element.type === "arrow"
      ? snapConnectorPatch(element, handle, rawPatch)
      : snapShapePatch(element, handle, rawPatch)
    : rawPatch;

  if (element.type === "text") {
    const textPatch = resizeTextElement(element, handle, patch, modifiers);
    sceneStore.updateById(element.id, (current) =>
      current.type === "text" ? updateElement(current, textPatch) : current,
    );
    return;
  }

  sceneStore.updateById(element.id, (current) => updateElement(current, patch));
}
