import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getTextContentSize,
  getTextSize,
  TEXT_ELEMENT_PADDING,
  TEXT_LINE_HEIGHT_RATIO,
  updateElement,
} from "@/entities/element";
import type { TextElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { expandFramesToFitChildren, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { viewportStore } from "@/entities/viewport";
import { textEditorStore } from "../model/textEditorStore";

function cloneTextElement(element: TextElement): TextElement {
  return { ...element, style: { ...element.style } };
}

export function TextEditorOverlay() {
  const editorState = useSyncExternalStore(
    textEditorStore.subscribe,
    textEditorStore.get,
    textEditorStore.get,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftRef = useRef("");
  const originalElementRef = useRef<TextElement | null>(null);
  const isFinishingRef = useRef(false);
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
    const elementId = editorState.elementId;
    const currentElement = elementId
      ? sceneStore.get().elements.find((item) => item.id === elementId)
      : null;

    if (!currentElement || currentElement.type !== "text") {
      return;
    }

    isFinishingRef.current = false;
    originalElementRef.current = cloneTextElement(currentElement);
    draftRef.current = currentElement.text;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(currentElement.text);

    const frame = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });

    return () => cancelAnimationFrame(frame);
  }, [editorState.elementId]);

  if (!editingText) {
    return null;
  }

  const editingElement = editingText;
  const screenX = (editingElement.x - viewport.x) * viewport.zoom;
  const screenY = (editingElement.y - viewport.y) * viewport.zoom;
  const contentSize = getTextContentSize(
    draft || " ",
    editingElement.fontSize,
    editingElement.fontFamily,
  );
  const fontSize = editingElement.fontSize * viewport.zoom;

  function growParentFramesIfNeeded() {
    const nextElements = expandFramesToFitChildren(sceneStore.get().elements);

    if (nextElements !== sceneStore.get().elements) {
      sceneStore.setElements(nextElements);
    }
  }

  function syncTextElement(nextText: string) {
    const size = getTextSize(
      nextText || " ",
      editingElement.fontSize,
      editingElement.fontFamily,
    );

    sceneStore.updateById(editingElement.id, (item) =>
      item.type === "text"
        ? updateElement(item, {
            text: nextText,
            width: size.width,
            height: size.height,
          })
        : item,
    );

    growParentFramesIfNeeded();
  }

  function updateDraft(nextDraft: string) {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    syncTextElement(nextDraft);
  }

  function commit() {
    if (isFinishingRef.current) {
      return;
    }

    isFinishingRef.current = true;

    const currentElement = sceneStore
      .get()
      .elements.find((item) => item.id === editingElement.id);

    if (!currentElement || currentElement.type !== "text") {
      historyStore.cancel();
      selectionStore.clear();
      textEditorStore.close();
      toolStore.set("selection");
      return;
    }

    const text = draftRef.current.replace(/\r\n/g, "\n");

    if (!text.trim() && editorState.wasCreated) {
      sceneStore.removeById(currentElement.id);
      selectionStore.clear();
    } else {
      const size = getTextSize(
        text || " ",
        currentElement.fontSize,
        currentElement.fontFamily,
      );
      sceneStore.updateById(currentElement.id, (item) =>
        item.type === "text"
          ? updateElement(item, {
              text,
              width: size.width,
              height: size.height,
            })
          : item,
      );
      growParentFramesIfNeeded();
      selectionStore.setElementIds([currentElement.id]);
    }

    historyStore.commit();
    textEditorStore.close();

    // Text is also a one-shot tool: return to the selection cursor after
    // committing so the finished label can immediately be moved or resized.
    toolStore.set("selection");
  }

  function cancel() {
    if (isFinishingRef.current) {
      return;
    }

    isFinishingRef.current = true;

    if (editorState.wasCreated) {
      sceneStore.removeById(editingElement.id);
      selectionStore.clear();
    } else if (originalElementRef.current) {
      const original = originalElementRef.current;
      sceneStore.updateById(editingElement.id, () =>
        cloneTextElement(original),
      );
    }

    historyStore.cancel();
    textEditorStore.close();
    toolStore.set("selection");
  }

  return (
    <textarea
      ref={textareaRef}
      aria-label="Редактирование текста"
      className="absolute z-30 resize-none overflow-hidden rounded-sm border border-dashed border-accent/60 bg-transparent p-0 outline-none"
      onBlur={commit}
      onChange={(event) => updateDraft(event.currentTarget.value)}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          commit();
          return;
        }

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          commit();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
      spellCheck={false}
      style={{
        left: screenX + TEXT_ELEMENT_PADDING * viewport.zoom,
        top: screenY + TEXT_ELEMENT_PADDING * viewport.zoom,
        width: Math.max(contentSize.width * viewport.zoom + 2, 22),
        height: Math.max(
          contentSize.height * viewport.zoom + 2,
          fontSize * 1.25,
        ),
        caretColor: editingElement.style.strokeColor,
        color: editingElement.style.strokeColor,
        fontFamily: editingElement.fontFamily,
        fontSize,
        lineHeight: TEXT_LINE_HEIGHT_RATIO,
        opacity: editingElement.style.opacity,
        textAlign: editingElement.textAlign,
      }}
      value={draft}
    />
  );
}
