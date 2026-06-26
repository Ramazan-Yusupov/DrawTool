import type { Theme } from "./types";

const THEME_STORAGE_KEY = "drawtool:theme";

type ThemeListener = () => void;

function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : "dark";
  } catch {
    return "dark";
  }
}

let theme: Theme = getInitialTheme();
const listeners = new Set<ThemeListener>();

function applyTheme(nextTheme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
}

function persistTheme(nextTheme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // The board still works when browser storage is unavailable.
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

applyTheme(theme);

export const themeStore = {
  get() {
    return theme;
  },

  set(nextTheme: Theme) {
    if (theme === nextTheme) {
      return;
    }

    theme = nextTheme;
    applyTheme(theme);
    persistTheme(theme);
    notifyListeners();
  },

  toggle() {
    this.set(theme === "dark" ? "light" : "dark");
  },

  subscribe(listener: ThemeListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
