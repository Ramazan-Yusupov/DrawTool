export type GenerateMode = "diagram" | "mermaid" | "code" | null;

type GenerateListener = () => void;
let mode: GenerateMode = null;
const listeners = new Set<GenerateListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const generateStore = {
  get() {
    return mode;
  },
  open(nextMode: Exclude<GenerateMode, null>) {
    mode = nextMode;
    notify();
  },
  close() {
    mode = null;
    notify();
  },
  subscribe(listener: GenerateListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
