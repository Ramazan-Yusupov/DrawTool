import { createSelection } from "./createSelection";
import type { SelectionState } from "./types";

type SelectionListener = () => void;

let selection = createSelection();
const listeners = new Set<SelectionListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function set(nextSelection: SelectionState) {
  selection = nextSelection;
  notifyListeners();
}

export const selectionStore = {
  get() {
    return selection;
  },

  setElementIds(elementIds: string[]) {
    set({ ...selection, elementIds: [...new Set(elementIds)], selectionBox: null });
  },

  toggleElementId(elementId: string) {
    const isSelected = selection.elementIds.includes(elementId);
    this.setElementIds(
      isSelected
        ? selection.elementIds.filter((id) => id !== elementId)
        : [...selection.elementIds, elementId],
    );
  },

  setSelectionBox(selectionBox: SelectionState["selectionBox"]) {
    set({ ...selection, selectionBox });
  },

  clear() {
    set(createSelection());
  },

  subscribe(listener: SelectionListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
