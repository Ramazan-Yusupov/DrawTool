type StickerSettings = {
  content: string;
  isPickerOpen: boolean;
  version: number;
};

type Listener = () => void;
let state: StickerSettings = { content: "✨", isPickerOpen: false, version: 0 };
const listeners = new Set<Listener>();

function set(next: Omit<StickerSettings, "version">) {
  state = { ...next, version: state.version + 1 };
  listeners.forEach((listener) => listener());
}

export const stickerSettingsStore = {
  get() { return state; },
  setContent(content: string) { set({ ...state, content, isPickerOpen: false }); },
  openPicker() { set({ ...state, isPickerOpen: true }); },
  closePicker() { set({ ...state, isPickerOpen: false }); },
  subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
};
