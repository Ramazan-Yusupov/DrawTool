type TextEditorState = {
  elementId: string | null;
  wasCreated: boolean;
};

type TextEditorListener = () => void;

let editorState: TextEditorState = { elementId: null, wasCreated: false };
const listeners = new Set<TextEditorListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export const textEditorStore = {
  get() {
    return editorState;
  },

  open(elementId: string, wasCreated = false) {
    editorState = { elementId, wasCreated };
    notifyListeners();
  },

  close() {
    if (!editorState.elementId) {
      return;
    }

    editorState = { elementId: null, wasCreated: false };
    notifyListeners();
  },

  subscribe(listener: TextEditorListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
