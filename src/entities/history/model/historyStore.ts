import type { BoardElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import type { HistorySnapshot, HistoryState } from "./types";

type HistoryListener = () => void;

let past: HistorySnapshot[] = [];
let future: HistorySnapshot[] = [];
let pendingSnapshot: HistorySnapshot | null = null;
let version = 0;

let cachedState: HistoryState = {
  canUndo: false,
  canRedo: false,
  version: 0,
};

const listeners = new Set<HistoryListener>();

function cloneElements(elements: BoardElement[]) {
  return JSON.parse(JSON.stringify(elements)) as BoardElement[];
}

function createSnapshot(): HistorySnapshot {
  return {
    elements: cloneElements(sceneStore.get().elements),
  };
}

function snapshotsMatch(left: HistorySnapshot, right: HistorySnapshot) {
  return JSON.stringify(left.elements) === JSON.stringify(right.elements);
}

function updateCachedState() {
  cachedState = {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    version,
  };
}

function notifyListeners() {
  version += 1;
  updateCachedState();

  listeners.forEach((listener) => listener());
}

export const historyStore = {
  get(): HistoryState {
    // Важно: всегда возвращает один и тот же объект,
    // пока история не изменилась.
    return cachedState;
  },

  begin() {
    if (pendingSnapshot) {
      return;
    }

    pendingSnapshot = createSnapshot();
  },

  commit() {
    if (!pendingSnapshot) {
      return false;
    }

    const currentSnapshot = createSnapshot();
    const changed = !snapshotsMatch(pendingSnapshot, currentSnapshot);

    if (changed) {
      past.push(pendingSnapshot);
      future = [];
      notifyListeners();
    }

    pendingSnapshot = null;

    return changed;
  },

  cancel() {
    pendingSnapshot = null;
  },

  undo() {
    if (pendingSnapshot || past.length === 0) {
      return false;
    }

    const previousSnapshot = past.pop();

    if (!previousSnapshot) {
      return false;
    }

    future.push(createSnapshot());
    sceneStore.setElements(previousSnapshot.elements);
    notifyListeners();

    return true;
  },

  redo() {
    if (pendingSnapshot || future.length === 0) {
      return false;
    }

    const nextSnapshot = future.pop();

    if (!nextSnapshot) {
      return false;
    }

    past.push(createSnapshot());
    sceneStore.setElements(nextSnapshot.elements);
    notifyListeners();

    return true;
  },

  clear() {
    past = [];
    future = [];
    pendingSnapshot = null;
    notifyListeners();
  },

  subscribe(listener: HistoryListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
