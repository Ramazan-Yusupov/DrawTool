import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getTextContentSize,
  getTextSize,
  TEXT_ELEMENT_PADDING,
  TEXT_LINE_HEIGHT_RATIO,
  updateElement,
} from "@/entities/element";
import type { BoardElement, CalloutElement, StickyElement, TextElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { expandFramesToFitChildren, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { viewportStore } from "@/entities/viewport";
import { editingLockStore } from "@/features/lock-editing";
import { toolLockStore } from "@/features/tool-lock";
import { textEditorStore } from "../model/textEditorStore";

type EditableTextElement = TextElement | StickyElement | CalloutElement;

function isEditableTextElement(element: BoardElement | null | undefined): element is EditableTextElement {
  return element?.type === "text" || element?.type === "sticky" || element?.type === "callout";
}

function cloneTextElement(element: EditableTextElement): EditableTextElement {
  return { ...element, style: { ...element.style } };
}

function getTextAlign(element: EditableTextElement) {
  return element.type === "text" ? element.textAlign : "left";
}

function getTextColor(element: EditableTextElement) {
  return element.type === "callout" ? "#f8fafc" : element.style.strokeColor;
}

export function TextEditorOverlay() {
  const editorState = useSyncExternalStore(textEditorStore.subscribe, textEditorStore.get, textEditorStore.get);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftRef = useRef("");
  const originalElementRef = useRef<EditableTextElement | null>(null);
  const isFinishingRef = useRef(false);
  const [draft, setDraft] = useState("");

  const scene = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
  const viewport = useSyncExternalStore(viewportStore.subscribe, viewportStore.get, viewportStore.get);
  const element = editorState.elementId ? scene.elements.find((item) => item.id === editorState.elementId) : null;
  const editingText = isEditableTextElement(element) ? element : null;

  useEffect(() => {
    const elementId = editorState.elementId;
    const currentElement = elementId ? sceneStore.get().elements.find((item) => item.id === elementId) : null;
    if (!isEditableTextElement(currentElement)) return;

    isFinishingRef.current = false;
    originalElementRef.current = cloneTextElement(currentElement);
    draftRef.current = currentElement.text;
    selectionStore.clear();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(currentElement.text);

    const frame = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [editorState.elementId]);

  if (!editingText) return null;
  const editingElement = editingText;
  const screenX = (editingElement.x - viewport.x) * viewport.zoom;
  const screenY = (editingElement.y - viewport.y) * viewport.zoom;
  const contentSize = getTextContentSize(draft || " ", editingElement.fontSize, editingElement.fontFamily);
  const fontSize = editingElement.fontSize * viewport.zoom;

  function updateDraft(nextDraft: string) {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }

  function growParentFramesIfNeeded() {
    const currentElements = sceneStore.get().elements;
    const nextElements = expandFramesToFitChildren(currentElements);
    if (nextElements !== currentElements) sceneStore.setElements(nextElements);
  }

  function restoreNextToolAfterEditing() {
    if (editingLockStore.get().isLocked) {
      selectionStore.clear();
      toolStore.set("pan");
      return;
    }
    if (!toolLockStore.get()) toolStore.set("selection");
  }

  function commit() {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    const currentElement = sceneStore.get().elements.find((item) => item.id === editingElement.id);
    if (!isEditableTextElement(currentElement)) {
      historyStore.cancel();
      selectionStore.clear();
      textEditorStore.close();
      restoreNextToolAfterEditing();
      return;
    }

    const text = draftRef.current.replace(/\r\n/g, "\n");
    if (text.length === 0 && editorState.wasCreated) {
      sceneStore.removeById(currentElement.id);
      selectionStore.clear();
      historyStore.commit();
      textEditorStore.close();
      restoreNextToolAfterEditing();
      return;
    }

    const size = getTextSize(text || " ", currentElement.fontSize, currentElement.fontFamily);
    sceneStore.updateById(currentElement.id, (item) => {
      if (!isEditableTextElement(item)) return item;
      const isCard = item.type === "sticky" || item.type === "callout";
      return updateElement(item, {
        text,
        width: isCard ? Math.max(item.width, size.width + TEXT_ELEMENT_PADDING * 2) : size.width,
        height: isCard ? Math.max(item.height, size.height + TEXT_ELEMENT_PADDING * 2) : size.height,
      });
    });
    growParentFramesIfNeeded();
    historyStore.commit();
    textEditorStore.close();
    selectionStore.setElementIds([currentElement.id]);
    restoreNextToolAfterEditing();
  }

  function cancel() {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    if (editorState.wasCreated) {
      sceneStore.removeById(editingElement.id);
      selectionStore.clear();
    } else if (originalElementRef.current) {
      const originalElement = originalElementRef.current;
      sceneStore.updateById(editingElement.id, () => cloneTextElement(originalElement));
      selectionStore.setElementIds([editingElement.id]);
    }
    historyStore.cancel();
    textEditorStore.close();
    restoreNextToolAfterEditing();
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
        height: Math.max(contentSize.height * viewport.zoom + 2, fontSize * 1.25),
        caretColor: getTextColor(editingElement),
        color: getTextColor(editingElement),
        fontFamily: editingElement.fontFamily,
        fontSize,
        lineHeight: TEXT_LINE_HEIGHT_RATIO,
        opacity: editingElement.style.opacity,
        textAlign: getTextAlign(editingElement),
      }}
      value={draft}
    />
  );
}
