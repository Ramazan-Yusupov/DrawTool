import type { BoardElement } from "@/entities/element";
import { createScene } from "./createScene";
import type { SceneState } from "./types";

type SceneListener = () => void;

let scene = createScene();
const listeners = new Set<SceneListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setScene(nextScene: SceneState) {
  scene = nextScene;
  notifyListeners();
}

function cloneElements(elements: BoardElement[]) {
  return JSON.parse(JSON.stringify(elements)) as BoardElement[];
}

export const sceneStore = {
  get() {
    return scene;
  },

  setElements(elements: BoardElement[]) {
    setScene({
      elements: cloneElements(elements),
      version: scene.version + 1,
    });
  },

  add(element: BoardElement) {
    setScene({
      elements: [...scene.elements, element],
      version: scene.version + 1,
    });
  },

  updateById(
    elementId: string,
    updater: (element: BoardElement) => BoardElement,
  ) {
    setScene({
      elements: scene.elements.map((element) =>
        element.id === elementId ? updater(element) : element,
      ),
      version: scene.version + 1,
    });
  },

  updateAll(updater: (element: BoardElement) => BoardElement) {
    setScene({
      elements: scene.elements.map(updater),
      version: scene.version + 1,
    });
  },

  removeById(elementId: string) {
    setScene({
      elements: scene.elements.filter((element) => element.id !== elementId),
      version: scene.version + 1,
    });
  },

  removeMany(elementIds: string[]) {
    const ids = new Set(elementIds);
    setScene({
      elements: scene.elements.filter((element) => !ids.has(element.id)),
      version: scene.version + 1,
    });
  },

  clear() {
    setScene(createScene());
  },

  subscribe(listener: SceneListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
