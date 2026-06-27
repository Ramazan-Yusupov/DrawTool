import type { Point } from "@/shared/types";
import { getArrowBindingAnchor } from "./arrowBinding";
import { getElementCenter } from "./getElementCenter";
import { getRelationAnchor } from "./getRelationAnchor";
import type { ArrowElement, BoardElement, CalloutElement, ElementBinding } from "../model/types";

const EPSILON = 0.01;

function equal(a: number, b: number) {
  return Math.abs(a - b) < EPSILON;
}

function getBoundTarget(binding: ElementBinding | undefined, byId: Map<string, BoardElement>) {
  return binding ? byId.get(binding.elementId) : undefined;
}

function syncArrow(arrow: ArrowElement, byId: Map<string, BoardElement>): ArrowElement {
  const rawStart = { x: arrow.x, y: arrow.y };
  const rawEnd = { x: arrow.x + arrow.width, y: arrow.y + arrow.height };
  const startTarget = getBoundTarget(arrow.startBinding, byId);
  const endTarget = getBoundTarget(arrow.endBinding, byId);

  const start = startTarget && arrow.startBinding
    ? getArrowBindingAnchor(startTarget, arrow.startBinding, rawEnd)
    : rawStart;
  const end = endTarget && arrow.endBinding
    ? getArrowBindingAnchor(endTarget, arrow.endBinding, start)
    : rawEnd;
  const refinedStart = startTarget && arrow.startBinding
    ? getArrowBindingAnchor(startTarget, arrow.startBinding, end)
    : start;

  if (
    equal(refinedStart.x, arrow.x) &&
    equal(refinedStart.y, arrow.y) &&
    equal(end.x, arrow.x + arrow.width) &&
    equal(end.y, arrow.y + arrow.height)
  ) {
    return arrow;
  }

  return {
    ...arrow,
    x: refinedStart.x,
    y: refinedStart.y,
    width: end.x - refinedStart.x,
    height: end.y - refinedStart.y,
  };
}

function getCalloutConnectionPoint(callout: CalloutElement, target: Point): Point {
  return getRelationAnchor(callout, target);
}

function syncCallout(callout: CalloutElement, byId: Map<string, BoardElement>): CalloutElement {
  const target = callout.targetId ? byId.get(callout.targetId) : undefined;
  if (!target) {
    return callout.targetId || callout.targetPoint
      ? { ...callout, targetId: undefined, targetPoint: undefined }
      : callout;
  }

  const targetPoint = getRelationAnchor(target, getElementCenter(callout));
  const connectionPoint = getCalloutConnectionPoint(callout, targetPoint);
  // Avoid a dead assignment while retaining the useful connection calc for the
  // renderer's geometric contract. The card itself remains freely movable.
  void connectionPoint;

  if (
    callout.targetPoint &&
    equal(callout.targetPoint.x, targetPoint.x) &&
    equal(callout.targetPoint.y, targetPoint.y)
  ) {
    return callout;
  }

  return { ...callout, targetPoint };
}

/** Synchronizes persisted relationships after any scene mutation. */
export function syncElementRelations(elements: BoardElement[]): BoardElement[] {
  const byId = new Map(elements.map((element) => [element.id, element]));
  let changed = false;

  const next = elements.map((element) => {
    if (element.type === "arrow") {
      const updated = syncArrow(element, byId);
      changed ||= updated !== element;
      return updated;
    }

    if (element.type === "callout") {
      const updated = syncCallout(element, byId);
      changed ||= updated !== element;
      return updated;
    }

    return element;
  });

  return changed ? next : elements;
}
