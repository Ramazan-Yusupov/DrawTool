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
import { editingLockStore } from "@/features/lock-editing";
import { toolLockStore } from "@/features/tool-lock";
import { textEditorStore } from "../model/textEditorStore";

function cloneTextElement(element: TextElement): TextElement {
  return {
    ...element,
    style: { ...element.style },
  };
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

  const viewport = useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.get,
    viewportStore.get,
  );

  const element = editorState.elementId
    ? scene.elements.find((item) => item.id === editorState.elementId)
    : null;

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

    // Во время печати текст не должен иметь selection-frame,
    // resize-handles и dashed-border от выделения.
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

  function updateDraft(nextDraft: string) {
    /*
     * Во время ввода не обновляем sceneStore:
     * - selection-frame остаётся скрытым;
     * - Frame не прыгает и не расширяется на каждый символ;
     * - textarea сам растёт по draft.
     */
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }

  function growParentFramesIfNeeded() {
    const currentElements = sceneStore.get().elements;
    const nextElements = expandFramesToFitChildren(currentElements);

    if (nextElements !== currentElements) {
      sceneStore.setElements(nextElements);
    }
  }

  function restoreNextToolAfterEditing() {
    if (editingLockStore.get().isLocked) {
      selectionStore.clear();
      toolStore.set("pan");
      return;
    }

    if (!toolLockStore.get()) {
      toolStore.set("selection");
    }
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
      restoreNextToolAfterEditing();
      return;
    }

    const text = draftRef.current.replace(/\r\n/g, "\n");

    /*
     * Удаляем только действительно пустой текст.
     * Один пробел или несколько пробелов считаются содержимым
     * и будут сохранены.
     */
    if (text.length === 0 && editorState.wasCreated) {
      sceneStore.removeById(currentElement.id);
      selectionStore.clear();

      historyStore.commit();
      textEditorStore.close();
      restoreNextToolAfterEditing();
      return;
    }

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

    /*
     * Только после Enter / blur Frame адаптируется под итоговый текст.
     * До этого пользователь не видит прыгающую рамку родителя.
     */
    growParentFramesIfNeeded();

    historyStore.commit();
    textEditorStore.close();

    /*
     * После подтверждения текст снова становится выбранным:
     * его можно сразу перетаскивать, менять размер или вращать.
     */
    selectionStore.setElementIds([currentElement.id]);

    restoreNextToolAfterEditing();
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
      const originalElement = originalElementRef.current;

      sceneStore.updateById(editingElement.id, () =>
        cloneTextElement(originalElement),
      );

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
