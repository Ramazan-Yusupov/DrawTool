import type { Point } from "@/shared/types";
import { getElementBounds } from "./getElementBounds";
import type { BoardElement } from "../model/types";

const EPSILON = 0.01;

function getCenter(element: BoardElement): Point {
  const bounds = getElementBounds(element);
  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
}

/**
 * Finds the point where a ray from a target's centre towards another point
 * exits its visual bounds. It works consistently for shapes, text, images and
 * containers and keeps connector endpoints on a useful edge.
 */
export function getRelationAnchor(element: BoardElement, toward: Point): Point {
  const bounds = getElementBounds(element);
  const center = getCenter(element);
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;

  if (Math.abs(dx) < EPSILON && Math.abs(dy) < EPSILON) {
    return { x: center.x + bounds.width / 2, y: center.y };
  }

  const scaleX = Math.abs(dx) / Math.max(bounds.width / 2, 1);
  const scaleY = Math.abs(dy) / Math.max(bounds.height / 2, 1);
  const scale = 1 / Math.max(scaleX, scaleY, EPSILON);

  return { x: center.x + dx * scale, y: center.y + dy * scale };
}
