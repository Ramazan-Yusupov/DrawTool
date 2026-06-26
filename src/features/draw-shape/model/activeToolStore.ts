import type { ActiveTool } from "./types";

type ToolListener = () => void;

let activeTool: ActiveTool = "selection";

const listeners = new Set<ToolListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const activeToolStore = {
  get() {
    return activeTool;
  },

  set(nextTool: ActiveTool) {
    activeTool = nextTool;
    notifyListeners();
  },

  subscribe(listener: ToolListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
