import type { SceneState } from "./types";

export function createScene(): SceneState {
  return {
    elements: [],
    version: 0,
  };
}
