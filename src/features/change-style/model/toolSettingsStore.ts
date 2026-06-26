import type { ElementStyle } from "@/entities/element";
import { createToolSettings } from "./createToolSettings";
import type { ToolSettings } from "./types";

type SettingsListener = () => void;

let settings = createToolSettings();

const listeners = new Set<SettingsListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setSettings(nextSettings: ToolSettings) {
  settings = nextSettings;
  notifyListeners();
}

export const toolSettingsStore = {
  get() {
    return settings;
  },

  patchStyle(patch: Partial<ElementStyle>) {
    setSettings({
      ...settings,
      style: {
        ...settings.style,
        ...patch,
      },
    });
  },

  setSnapToGrid(snapToGrid: boolean) {
    setSettings({
      ...settings,
      snapToGrid,
    });
  },

  reset() {
    setSettings(createToolSettings());
  },

  subscribe(listener: SettingsListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};
