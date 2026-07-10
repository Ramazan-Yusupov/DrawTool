import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getElementCenter,
  getTextContentSize,
  getTextSize,
  TEXT_ELEMENT_PADDING,
  TEXT_LINE_HEIGHT_RATIO,
  updateElement,
} from "@/entities/element";
import type {
  BoardElement,
  CalloutElement,
  StickyElement,
  TextElement,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { expandFramesToFitChildren, sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { viewportStore } from "@/entities/viewport";
import { editingLockStore } from "@/features/lock-editing";
import { toolLockStore } from "@/features/tool-lock";
import { textEditorStore } from "../model/textEditorStore";

type EditableTextElement = TextElement | StickyElement | CalloutElement;
type EditableLabelElement = Extract<
  BoardElement,
  {
    type:
      | "arrow"
      | "badge"
      | "cloud"
      | "diamond"
      | "ellipse"
      | "hexagon"
      | "line"
      | "rectangle"
      | "star"
      | "triangle";
  }
>;

const TEXT_EDITOR_SIDE_PADDING_RATIO = 1;
const TEXT_EDITOR_MIN_SIDE_PADDING = 12;
const TEXT_EDITOR_TYPING_RESERVE_CHARS = 0;

function isEditableTextElement(
  element: BoardElement | null | undefined,
): element is EditableTextElement {
  return (
    element?.type === "text" ||
    element?.type === "sticky" ||
    element?.type === "callout"
  );
}

function isEditableLabelElement(
  element: BoardElement | null | undefined,
): element is EditableLabelElement {
  return Boolean(
    element &&
    (element.type === "badge" ||
      element.type === "rectangle" ||
      element.type === "ellipse" ||
      element.type === "diamond" ||
      element.type === "triangle" ||
      element.type === "hexagon" ||
      element.type === "star" ||
      element.type === "cloud" ||
      element.type === "line" ||
      element.type === "arrow"),
  );
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

function getTextEditorHorizontalPadding(fontSize: number, zoom: number) {
  return (
    Math.max(
      TEXT_EDITOR_MIN_SIDE_PADDING,
      fontSize * TEXT_EDITOR_SIDE_PADDING_RATIO,
    ) * zoom
  );
}

function getTextEditorTypingReserve(fontSize: number, zoom: number) {
  return fontSize * TEXT_EDITOR_TYPING_RESERVE_CHARS * 0.62 * zoom;
}

function getTextEditorLeft({
  align,
  contentLeft,
  contentRight,
  editorWidth,
  padding,
}: {
  align: CanvasTextAlign;
  contentLeft: number;
  contentRight: number;
  editorWidth: number;
  padding: number;
}) {
  if (align === "center") {
    return (contentLeft + contentRight) / 2 - editorWidth / 2;
  }

  if (align === "right") {
    return contentRight - editorWidth + padding;
  }

  return contentLeft - padding;
}

export function TextEditorOverlay() {
  const editorState = useSyncExternalStore(
    textEditorStore.subscribe,
    textEditorStore.get,
    textEditorStore.get,
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftRef = useRef("");
  const originalLabelRef = useRef<string | undefined>(undefined);
  const originalElementRef = useRef<EditableTextElement | null>(null);
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
  const editingText = isEditableTextElement(element) ? element : null;
  const editingLabel =
    editorState.mode === "label" && isEditableLabelElement(element)
      ? element
      : null;

  useEffect(() => {
    const elementId = editorState.elementId;
    const currentElement = elementId
      ? sceneStore.get().elements.find((item) => item.id === elementId)
      : null;
    if (editorState.mode === "label") {
      if (!isEditableLabelElement(currentElement)) return;

      isFinishingRef.current = false;
      originalElementRef.current = null;
      originalLabelRef.current = currentElement.label;
      draftRef.current = currentElement.label ?? "";
      selectionStore.clear();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(currentElement.label ?? "");

      const frame = requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        textarea?.focus();
        textarea?.select();
      });
      return () => cancelAnimationFrame(frame);
    }

    if (!isEditableTextElement(currentElement)) return;

    isFinishingRef.current = false;
    originalElementRef.current = cloneTextElement(currentElement);
    originalLabelRef.current = undefined;
    draftRef.current = currentElement.text;
    selectionStore.clear();
    setDraft(currentElement.text);

    const frame = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [editorState.elementId, editorState.mode]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || editorState.mode !== "text") return;

    textarea.scrollLeft = 0;
    textarea.scrollTop = 0;
  }, [draft, editorState.mode]);

  const activeElement = editingText ?? editingLabel;
  if (!activeElement) return null;
  const activeElementId = activeElement.id;
  const activeElementStyle = activeElement.style;
  const isArrowLabelMode = editingLabel?.type === "arrow";

  const isLabelMode = Boolean(editingLabel);
  const labelCenter = editingLabel ? getElementCenter(editingLabel) : null;
  const editorFontSize = isLabelMode ? 15 : (editingText?.fontSize ?? 15);
  const editorFontFamily = isLabelMode
    ? "Inter, ui-sans-serif, system-ui, sans-serif"
    : (editingText?.fontFamily ??
      "Inter, ui-sans-serif, system-ui, sans-serif");
  const contentSize = getTextContentSize(
    draft || " ",
    editorFontSize,
    editorFontFamily,
  );
  const fontSize = editorFontSize * viewport.zoom;
  const lineHeight =
    Math.ceil(editorFontSize * TEXT_LINE_HEIGHT_RATIO) * viewport.zoom;
  const textAlign = editingText ? getTextAlign(editingText) : "left";
  const textHorizontalPadding = getTextEditorHorizontalPadding(
    editorFontSize,
    viewport.zoom,
  );
  const textVerticalPadding =
    Math.max(4, editorFontSize * 0.25) * viewport.zoom;
  const textContentWidth = contentSize.width * viewport.zoom;
  const textContentHeight = contentSize.height * viewport.zoom;
  const textTypingReserve = isLabelMode
    ? 0
    : getTextEditorTypingReserve(editorFontSize, viewport.zoom);
  const textEditorWidth = Math.max(
    textContentWidth + textHorizontalPadding * 2 + textTypingReserve,
    28 * viewport.zoom,
  );
  const textEditorHeight = Math.max(
    textContentHeight + textVerticalPadding * 2,
    lineHeight + textVerticalPadding * 2,
  );
  const textContentLeft = editingText
    ? (editingText.x + TEXT_ELEMENT_PADDING - viewport.x) * viewport.zoom
    : 0;
  const textContentRight = editingText
    ? (editingText.x + editingText.width - TEXT_ELEMENT_PADDING - viewport.x) *
      viewport.zoom
    : 0;
  const textContentTop = editingText
    ? (editingText.y +
        (editingText.height - contentSize.height) / 2 -
        viewport.y) *
      viewport.zoom
    : 0;
  const textEditorLeft = editingText
    ? getTextEditorLeft({
        align: textAlign,
        contentLeft: textContentLeft,
        contentRight: textContentRight,
        editorWidth: textEditorWidth,
        padding: textHorizontalPadding,
      })
    : 0;
  const textEditorTop = textContentTop - textVerticalPadding;
  const labelWidth = Math.max(contentSize.width * viewport.zoom + 24, 84);
  const labelHeight = Math.max(contentSize.height * viewport.zoom + 12, 30);
  const labelHorizontalPadding = 12;
  const labelVerticalPadding = Math.max(0, (labelHeight - lineHeight) / 2);
  const labelScreenX = labelCenter
    ? (labelCenter.x - viewport.x) * viewport.zoom - labelWidth / 2
    : 0;
  const labelScreenY = labelCenter
    ? (labelCenter.y - viewport.y) * viewport.zoom - labelHeight / 2
    : 0;

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
    const currentElement = sceneStore
      .get()
      .elements.find((item) => item.id === activeElementId);
    if (isLabelMode) {
      if (!isEditableLabelElement(currentElement)) {
        historyStore.cancel();
        selectionStore.clear();
        textEditorStore.close();
        restoreNextToolAfterEditing();
        return;
      }

      sceneStore.updateById(currentElement.id, (item) =>
        isEditableLabelElement(item)
          ? updateElement(item, { label: draftRef.current.trim() || undefined })
          : item,
      );
      historyStore.commit();
      textEditorStore.close();
      selectionStore.setElementIds([currentElement.id]);
      restoreNextToolAfterEditing();
      return;
    }

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

    const size = getTextSize(
      text || " ",
      currentElement.fontSize,
      currentElement.fontFamily,
    );
    sceneStore.updateById(currentElement.id, (item) => {
      if (!isEditableTextElement(item)) return item;
      const isCard = item.type === "sticky" || item.type === "callout";
      return updateElement(item, {
        text,
        width: isCard
          ? Math.max(item.width, size.width + TEXT_ELEMENT_PADDING * 2)
          : size.width,
        height: isCard
          ? Math.max(item.height, size.height + TEXT_ELEMENT_PADDING * 2)
          : size.height,
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
      sceneStore.removeById(activeElementId);
      selectionStore.clear();
    } else if (isLabelMode) {
      sceneStore.updateById(activeElementId, (item) =>
        isEditableLabelElement(item)
          ? updateElement(item, { label: originalLabelRef.current })
          : item,
      );
      selectionStore.setElementIds([activeElementId]);
    } else if (originalElementRef.current) {
      const originalElement = originalElementRef.current;
      sceneStore.updateById(activeElementId, () =>
        cloneTextElement(originalElement),
      );
      selectionStore.setElementIds([activeElementId]);
    }
    historyStore.cancel();
    textEditorStore.close();
    restoreNextToolAfterEditing();
  }

  return (
    <textarea
      ref={textareaRef}
      aria-label="Редактирование текста"
      className={`absolute z-30 resize-none overflow-hidden outline-none ${
        isLabelMode
          ? isArrowLabelMode
            ? "rounded-md border border-border bg-slate-950/90 px-2 py-1 shadow-panel"
            : "border-0 bg-transparent p-0"
          : "border-0 bg-transparent p-0"
      }`}
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
      wrap="off"
      style={{
        borderRadius: isLabelMode ? 4 : 0,
        boxSizing: "border-box",
        left: isLabelMode ? labelScreenX : textEditorLeft,
        top: isLabelMode ? labelScreenY : textEditorTop,
        width: isLabelMode ? labelWidth : textEditorWidth,
        height: isLabelMode ? labelHeight : textEditorHeight,
        padding: isLabelMode
          ? `${labelVerticalPadding}px ${labelHorizontalPadding}px`
          : `${textVerticalPadding}px ${textHorizontalPadding}px`,
        caretColor: isLabelMode
          ? activeElementStyle.strokeColor
          : getTextColor(activeElement as EditableTextElement),
        color: isLabelMode
          ? activeElementStyle.strokeColor
          : getTextColor(activeElement as EditableTextElement),
        fontFamily: editorFontFamily,
        fontSize,
        lineHeight: `${lineHeight}px`,
        opacity: activeElementStyle.opacity,
        textAlign: isLabelMode ? "center" : textAlign,
        whiteSpace: "pre",
      }}
      value={draft}
    />
  );
}
