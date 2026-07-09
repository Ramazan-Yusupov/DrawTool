import {
  getArrowCurveOffset,
  getElementBounds,
  getElementCenter,
  getElementRotation,
  getTextSize,
  updateElement,
} from "@/entities/element";
import type { BoardElement, FrameElement, TextElement } from "@/entities/element";
import {
  expandFramesToFitChildren,
  scaleFrameChild,
  sceneStore,
} from "@/entities/scene";
import { CANVAS_CONFIG } from "@/shared/config";
import { clamp, rotatePoint } from "@/shared/lib";
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

function getGeometryCenter(geometry: Pick<BoardElement, "x" | "y" | "width" | "height">) {
  return {
    x: geometry.x + geometry.width / 2,
    y: geometry.y + geometry.height / 2,
  };
}

function getFixedResizeAnchor(
  geometry: Pick<BoardElement, "x" | "y" | "width" | "height">,
  handle: ResizeHandle,
) {
  const center = getGeometryCenter(geometry);
  const right = geometry.x + geometry.width;
  const bottom = geometry.y + geometry.height;

  return {
    x: handle.includes("w")
      ? right
      : handle.includes("e")
        ? geometry.x
        : center.x,
    y: handle.includes("n")
      ? bottom
      : handle.includes("s")
        ? geometry.y
        : center.y,
  };
}

function anchorRotatedPatch(
  element: BoardElement,
  handle: ResizeHandle,
  patch: GeometryPatch,
  resizeFromCenter: boolean,
): GeometryPatch {
  const angle = getElementRotation(element);

  if (
    angle === 0 ||
    resizeFromCenter ||
    element.type === "line" ||
    element.type === "arrow" ||
    element.type === "measure"
  ) {
    return patch;
  }

  const initialGeometry = getGeometry(element, {});
  const nextGeometry = getGeometry(element, patch);
  const initialCenter = getGeometryCenter(initialGeometry);
  const nextCenter = getGeometryCenter(nextGeometry);
  const fixedAnchor = getFixedResizeAnchor(initialGeometry, handle);
  const fixedAnchorWorld = rotatePoint(fixedAnchor, initialCenter, angle);
  const nextFixedAnchor = getFixedResizeAnchor(nextGeometry, handle);
  const nextAnchorOffset = {
    x: nextFixedAnchor.x - nextCenter.x,
    y: nextFixedAnchor.y - nextCenter.y,
  };
  const rotatedOffset = rotatePoint(nextAnchorOffset, { x: 0, y: 0 }, angle);
  const anchoredCenter = {
    x: fixedAnchorWorld.x - rotatedOffset.x,
    y: fixedAnchorWorld.y - rotatedOffset.y,
  };

  return {
    ...patch,
    x: anchoredCenter.x - nextGeometry.width / 2,
    y: anchoredCenter.y - nextGeometry.height / 2,
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
  initialFrameChildren = new Map<string, BoardElement>(),
) {
  if (
    element.type === "arrow" &&
    element.routing === "straight" &&
    handle.startsWith("waypoint:")
  ) {
    const waypointIndex = Number(handle.split(":")[1]);
    const point = modifiers.snapToGrid
      ? snapPointToGrid(currentPoint, CANVAS_CONFIG.defaultSnapSize)
      : currentPoint;

    sceneStore.updateById(element.id, (current) => {
      if (current.type !== "arrow") return current;
      const waypoints = [...(current.waypoints ?? [])];
      if (!Number.isInteger(waypointIndex) || !waypoints[waypointIndex]) {
        return current;
      }

      waypoints[waypointIndex] = point;
      return updateElement(current, { waypoints });
    });
    return;
  }

  if (element.type === "arrow" && handle.startsWith("waypoint:")) {
    return;
  }

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

  if (element.type === "arrow" && handle === "curve") {
    const center = getElementCenter(element);
    const localPoint = rotatePoint(
      modifiers.snapToGrid
        ? snapPointToGrid(currentPoint, CANVAS_CONFIG.defaultSnapSize)
        : currentPoint,
      center,
      -getElementRotation(element),
    );

    sceneStore.updateById(element.id, (current) =>
      current.type === "arrow"
        ? updateElement(current, {
            curveOffset: clamp(getArrowCurveOffset(element, localPoint), -2.5, 2.5),
          })
        : current,
    );
    return;
  }

  // Handles are displayed in world space after rotation. Convert both pointer
  // points back into the element's local coordinate system before resizing.
  const center = getElementCenter(element);
  const inverseAngle = -getElementRotation(element);
  const localStartPoint = rotatePoint(startPoint, center, inverseAngle);
  const localCurrentPoint = rotatePoint(currentPoint, center, inverseAngle);

  const rawPatch = calculateResize(
    element,
    handle,
    localStartPoint,
    localCurrentPoint,
    {
      ...modifiers,
      // Raster and vector images retain their intrinsic proportions by default.
      keepAspectRatio: modifiers.keepAspectRatio || element.type === "image",
    },
  );
  const patch = modifiers.snapToGrid
    ? element.type === "line" || element.type === "arrow" || element.type === "measure"
      ? snapConnectorPatch(element, handle, rawPatch)
      : snapShapePatch(element, handle, rawPatch)
    : rawPatch;
  const anchoredPatch = anchorRotatedPatch(
    element,
    handle,
    patch,
    modifiers.resizeFromCenter,
  );

  if (element.type === "frame") {
    const nextFrame = updateElement(element, anchoredPatch) as FrameElement;

    sceneStore.updateAll((current) => {
      if (current.id === element.id) {
        return nextFrame;
      }

      const initialChild = initialFrameChildren.get(current.id);
      return initialChild
        ? scaleFrameChild(initialChild, element, nextFrame)
        : current;
    });
    return;
  }

  if (element.type === "freedraw" || element.type === "highlighter") {
    const geometry = getGeometry(element, anchoredPatch);
    const bounds = getElementBounds(element);
    const scaleX = geometry.width / Math.max(bounds.width, 1);
    const scaleY = geometry.height / Math.max(bounds.height, 1);
    const points = element.points.map((point) => ({
      x: geometry.x + (point.x - bounds.x) * scaleX,
      y: geometry.y + (point.y - bounds.y) * scaleY,
    }));

    sceneStore.updateById(element.id, (current) =>
      current.type === "freedraw" || current.type === "highlighter"
        ? updateElement(current, { ...geometry, points })
        : current,
    );
    return;
  }

  if (element.type === "text") {
    const textPatch = resizeTextElement(element, handle, patch, modifiers);
    const anchoredTextPatch = anchorRotatedPatch(
      element,
      handle,
      textPatch,
      modifiers.resizeFromCenter,
    );
    sceneStore.updateById(element.id, (current) =>
      current.type === "text" ? updateElement(current, anchoredTextPatch) : current,
    );

    const nextElements = expandFramesToFitChildren(sceneStore.get().elements);
    if (nextElements !== sceneStore.get().elements) {
      sceneStore.setElements(nextElements);
    }
    return;
  }

  sceneStore.updateById(element.id, (current) => {
    if (current.type === "arrow" && (handle === "start" || handle === "end")) {
      return updateElement(current, {
        ...anchoredPatch,
        ...(handle === "start" ? { startBinding: undefined } : { endBinding: undefined }),
      });
    }
    return updateElement(current, anchoredPatch);
  });
}
