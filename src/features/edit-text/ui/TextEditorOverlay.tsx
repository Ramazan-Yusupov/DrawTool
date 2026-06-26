import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getTextSize, updateElement } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { viewportStore } from "@/entities/viewport";
import { textEditorStore } from "../model/textEditorStore";

export function TextEditorOverlay() {
  const editorState = useSyncExternalStore(
    textEditorStore.subscribe,
    textEditorStore.get,
    textEditorStore.get,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftRef = useRef("");
  const [draft, setDraft] = useState("");

  const scene = useSyncExternalStore(
    sceneStore.subscribe,
    sceneStore.get,
    sceneStore.get,
  );
  const element = editorState.elementId
    ? scene.elements.find((item) => item.id === editorState.elementId)
    : null;
  const viewport = useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.get,
    viewportStore.get,
  );
  const editingText = element?.type === "text" ? element : null;

  useEffect(() => {
    if (!editingText) {
      return;
    }

    const initialText = editingText.text;
    draftRef.current = initialText;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(initialText);

    const frame = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });

    return () => cancelAnimationFrame(frame);
  }, [editorState.elementId, editingText]);

  if (!editingText) {
    return null;
  }

  const editingElement = editingText;
  const screenX = (editingElement.x - viewport.x) * viewport.zoom;
  const screenY = (editingElement.y - viewport.y) * viewport.zoom;
  const fontSize = editingElement.fontSize * viewport.zoom;
  const draftSize = getTextSize(draft || " ", editingElement.fontSize);

  function updateDraft(nextDraft: string) {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }

  function commit() {
    const currentElement = sceneStore
      .get()
      .elements.find((item) => item.id === editingElement.id);

    if (!currentElement || currentElement.type !== "text") {
      textEditorStore.close();
      return;
    }

    const text = draftRef.current.trimEnd();

    if (!text && editorState.wasCreated) {
      sceneStore.removeById(currentElement.id);
    } else {
      const size = getTextSize(text || " ", currentElement.fontSize);
      sceneStore.updateById(currentElement.id, (item) =>
        item.type === "text"
          ? updateElement(item, {
              text,
              width: size.width,
              height: size.height,
            })
          : item,
      );
    }

    textEditorStore.close();
  }

  function cancel() {
    if (editorState.wasCreated) {
      sceneStore.removeById(editingElement.id);
    }

    textEditorStore.close();
  }

  return (
    <textarea
      ref={textareaRef}
      aria-label="Редактирование текста"
      className="absolute z-30 resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
      onBlur={commit}
      onChange={(event) => updateDraft(event.currentTarget.value)}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
      spellCheck={false}
      style={{
        left: screenX,
        top: screenY,
        width: Math.max(draftSize.width * viewport.zoom + 16, 80),
        height: Math.max(draftSize.height * viewport.zoom + 12, fontSize * 1.4),
        caretColor: editingElement.style.strokeColor,
        color: editingElement.style.strokeColor,
        fontFamily: editingElement.fontFamily,
        fontSize,
        lineHeight: 1.25,
        opacity: editingElement.style.opacity,
        textAlign: editingElement.textAlign,
      }}
      value={draft}
    />
  );
}
