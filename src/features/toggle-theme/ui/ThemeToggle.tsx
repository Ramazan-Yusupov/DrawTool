import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { themeStore } from "../model/themeStore";
import { toggleTheme } from "../model/toggleTheme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    themeStore.get,
  );
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      className="absolute right-4 top-4 z-30 grid size-10 place-items-center rounded-lg border border-border bg-panel text-text shadow-panel transition-colors hover:bg-control max-lg:right-[max(0.5rem,env(safe-area-inset-right))] max-lg:top-[max(0.5rem,env(safe-area-inset-top))] max-lg:size-11"
      onClick={toggleTheme}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      type="button"
    >
      {isDark ? <Sun aria-hidden size={18} /> : <Moon aria-hidden size={18} />}
    </button>
  );
}
