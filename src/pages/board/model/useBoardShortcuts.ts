import { useEffect } from "react";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    target.matches("input, textarea, select, [contenteditable='true']")
  );
}

export function useBoardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedIds = new Set(selectionStore.get().elementIds);
        if (selectedIds.size === 0) {
          return;
        }

        event.preventDefault();
        [...selectedIds].forEach((elementId) => sceneStore.removeById(elementId));
        selectionStore.clear();
      }

      if (event.key === "Escape") {
        selectionStore.clear();
        toolStore.set("selection");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
