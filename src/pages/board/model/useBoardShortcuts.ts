import { useEffect } from "react";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { deleteSelectedElements } from "@/features/delete-elements";

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

      const modifierPressed = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (modifierPressed && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          historyStore.redo();
        } else {
          historyStore.undo();
        }
        return;
      }

      if (modifierPressed && key === "y") {
        event.preventDefault();
        historyStore.redo();
        return;
      }

      if (modifierPressed && key === "d") {
        const selectedElements = sceneStore
          .get()
          .elements.filter((element) => selectionStore.get().elementIds.includes(element.id));

        if (selectedElements.length > 0) {
          event.preventDefault();
          historyStore.begin();
          const copies = selectedElements.map((element) => {
            const copy = JSON.parse(JSON.stringify(element)) as typeof element;
            copy.id = `${element.id}-copy-${Date.now()}`;
            copy.x += 20;
            copy.y += 20;
            copy.updatedAt = Date.now();
            copy.createdAt = Date.now();
            if (copy.type === "freedraw") {
              copy.points = copy.points.map((point) => ({ x: point.x + 20, y: point.y + 20 }));
            }
            return copy;
          });
          sceneStore.setElements([...sceneStore.get().elements, ...copies]);
          selectionStore.setElementIds(copies.map((element) => element.id));
          historyStore.commit();
        }
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedElements();
        return;
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
