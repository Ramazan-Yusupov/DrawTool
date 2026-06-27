import type { BoardElement } from "@/entities/element";
import type { SceneState } from "./types";

/** Finds one element by id without exposing scene storage details. */
export function getSceneElementById(scene: SceneState, id: string) {
  return scene.elements.find((element) => element.id === id) ?? null;
}

/** Returns elements in scene order for the requested ids. */
export function getSceneElementsByIds(scene: SceneState, ids: readonly string[]) {
  const requestedIds = new Set(ids);
  return scene.elements.filter((element) => requestedIds.has(element.id));
}

/** Narrow selector for render and UI counters. */
export function getSceneElementCount(scene: SceneState) {
  return scene.elements.length;
}

export function getSceneElementsByType<T extends BoardElement["type"]>(
  scene: SceneState,
  type: T,
) {
  return scene.elements.filter((element) => element.type === type);
}
