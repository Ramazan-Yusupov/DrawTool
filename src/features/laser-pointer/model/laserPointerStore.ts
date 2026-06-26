import type { Point } from "@/shared/types";

type LaserState = {
  points: Point[];
  active: boolean;
  version: number;
};

type LaserListener = () => void;

let state: LaserState = { points: [], active: false, version: 0 };
const listeners = new Set<LaserListener>();
let clearTimer: number | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

function set(next: Omit<LaserState, "version">) {
  state = { ...next, version: state.version + 1 };
  notify();
}

function cancelClearTimer() {
  if (clearTimer !== null) {
    window.clearTimeout(clearTimer);
    clearTimer = null;
  }
}

export const laserPointerStore = {
  get() {
    return state;
  },

  start(point: Point) {
    cancelClearTimer();
    set({ points: [point], active: true });
  },

  add(point: Point) {
    if (!state.active) {
      return;
    }

    const previous = state.points.at(-1);
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 1) {
      return;
    }

    set({ points: [...state.points.slice(-40), point], active: true });
  },

  finish() {
    if (!state.active) {
      return;
    }

    set({ points: state.points, active: false });
    cancelClearTimer();
    clearTimer = window.setTimeout(() => {
      clearTimer = null;
      set({ points: [], active: false });
    }, 720);
  },

  clear() {
    cancelClearTimer();
    set({ points: [], active: false });
  },

  subscribe(listener: LaserListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
