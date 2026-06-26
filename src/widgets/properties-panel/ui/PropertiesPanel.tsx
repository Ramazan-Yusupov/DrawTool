import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowRightLeft,
  BringToFront,
  CaseSensitive,
  Copy,
  MoveDown,
  MoveUp,
  Route,
  SendToBack,
  Settings2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { createId } from "@/shared/lib";
import { getTextSize, updateElement } from "@/entities/element";
import type {
  ArrowRouting,
  BoardElement,
  ElementStyle,
  TextAlign,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { getSelectedElements, selectionStore } from "@/entities/selection";
import { TOOL_LABELS, toolStore } from "@/entities/tool";
import {
  SnapSection,
  ToolStyleSection,
  TOOL_SETTINGS_CAPABILITIES,
  toolSettingsStore,
} from "@/features/change-style";
import { NumberField, SegmentedControl } from "@/shared/ui";
import { EmbedSection } from "./EmbedSection";

const ARROW_ROUTING_ITEMS = [
  { label: "Прямая стрелка", value: "straight", icon: Route, iconOnly: true },
  {
    label: "Сгибающаяся стрелка",
    value: "elbow",
    icon: ArrowRightLeft,
    iconOnly: true,
  },
] as const;

const TEXT_ALIGN_ITEMS = [
  {
    label: "Выровнять по левому краю",
    value: "left",
    icon: AlignLeft,
    iconOnly: true,
  },
  {
    label: "Выровнять по центру",
    value: "center",
    icon: AlignCenter,
    iconOnly: true,
  },
  {
    label: "Выровнять по правому краю",
    value: "right",
    icon: AlignRight,
    iconOnly: true,
  },
] as const;

type StyleTarget = {
  style: ElementStyle;
  type: BoardElement["type"] | "tool";
};

type LayerAction = "back" | "backward" | "forward" | "front";

function cloneForDuplicate(element: BoardElement): BoardElement {
  const copy = JSON.parse(JSON.stringify(element)) as BoardElement;
  const now = Date.now();

  copy.id = createId(element.type);
  copy.createdAt = now;
  copy.updatedAt = now;
  copy.x += 20;
  copy.y += 20;
  copy.style = { ...copy.style };

  if (copy.type === "freedraw") {
    copy.points = copy.points.map((point) => ({
      x: point.x + 20,
      y: point.y + 20,
    }));
  }

  return copy;
}

function reorderElements(
  elements: BoardElement[],
  selectedIds: Set<string>,
  action: LayerAction,
) {
  const next = [...elements];

  if (action === "front") {
    return [
      ...next.filter((element) => !selectedIds.has(element.id)),
      ...next.filter((element) => selectedIds.has(element.id)),
    ];
  }

  if (action === "back") {
    return [
      ...next.filter((element) => selectedIds.has(element.id)),
      ...next.filter((element) => !selectedIds.has(element.id)),
    ];
  }

  if (action === "forward") {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      if (
        selectedIds.has(next[index].id) &&
        !selectedIds.has(next[index + 1].id)
      ) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
    }
    return next;
  }

  for (let index = 1; index < next.length; index += 1) {
    if (
      selectedIds.has(next[index].id) &&
      !selectedIds.has(next[index - 1].id)
    ) {
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
    }
  }

  return next;
}

export function PropertiesPanel() {
  const [isCompactPanelOpen, setIsCompactPanelOpen] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const closeCompactPanelOnDesktop = () => {
      if (desktopQuery.matches) {
        setIsCompactPanelOpen(false);
      }
    };

    closeCompactPanelOnDesktop();
    desktopQuery.addEventListener("change", closeCompactPanelOnDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeCompactPanelOnDesktop);
    };
  }, []);

  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );
  const scene = useSyncExternalStore(
    sceneStore.subscribe,
    sceneStore.get,
    sceneStore.get,
  );
  const selection = useSyncExternalStore(
    selectionStore.subscribe,
    selectionStore.get,
    selectionStore.get,
  );
  const getSettings = useCallback(
    () => toolSettingsStore.get(activeTool),
    [activeTool],
  );
  const toolSettings = useSyncExternalStore(
    toolSettingsStore.subscribe,
    getSettings,
    getSettings,
  );

  const selectedElements = getSelectedElements(scene.elements, selection);
  const primaryElement =
    selectedElements.length === 1 ? selectedElements[0] : null;
  const targetType = primaryElement?.type ?? activeTool;
  const capabilities = TOOL_SETTINGS_CAPABILITIES[targetType];
  const target: StyleTarget = {
    type: primaryElement?.type ?? "tool",
    style: primaryElement?.style ?? toolSettings.style,
  };
  const title = primaryElement
    ? TOOL_LABELS[primaryElement.type]
    : selectedElements.length > 1
      ? `Выбрано: ${selectedElements.length}`
      : `Инструмент: ${TOOL_LABELS[activeTool]}`;

  function mutateScene(action: () => void) {
    historyStore.begin();
    action();
    historyStore.commit();
  }

  function patchSelectedStyle(patch: Partial<ElementStyle>) {
    if (selectedElements.length === 0) {
      toolSettingsStore.patchStyle(activeTool, patch);
      return;
    }

    const selectedIds = new Set(selectedElements.map((element) => element.id));
    mutateScene(() => {
      sceneStore.updateAll((element) =>
        selectedIds.has(element.id)
          ? updateElement(element, { style: { ...element.style, ...patch } })
          : element,
      );
    });
  }

  function changeEmbedUrl(url: string) {
    if (primaryElement?.type !== "embed") {
      return;
    }

    mutateScene(() => {
      sceneStore.updateById(primaryElement.id, (element) =>
        element.type === "embed" ? updateElement(element, { url }) : element,
      );
    });
  }

  function changeArrowRouting(routing: ArrowRouting) {
    if (primaryElement?.type === "arrow") {
      mutateScene(() => {
        sceneStore.updateById(primaryElement.id, (element) =>
          element.type === "arrow"
            ? updateElement(element, { routing })
            : element,
        );
      });
      return;
    }

    toolSettingsStore.setArrowRouting(activeTool, routing);
  }

  function changeTextOptions(patch: {
    fontSize?: number;
    textAlign?: TextAlign;
  }) {
    if (primaryElement?.type === "text") {
      mutateScene(() => {
        sceneStore.updateById(primaryElement.id, (element) => {
          if (element.type !== "text") {
            return element;
          }

          const fontSize = patch.fontSize ?? element.fontSize;
          const size = getTextSize(
            element.text || " ",
            fontSize,
            element.fontFamily,
          );

          return updateElement(element, {
            ...patch,
            width: size.width,
            height: size.height,
          });
        });
      });
      return;
    }

    toolSettingsStore.setTextOptions("text", {
      fontSize: patch.fontSize ?? toolSettings.fontSize,
      fontFamily: toolSettings.fontFamily,
      textAlign: patch.textAlign ?? toolSettings.textAlign,
    });
  }

  function deleteSelection() {
    if (selectedElements.length === 0) {
      return;
    }

    mutateScene(() => {
      sceneStore.removeMany(selectedElements.map((element) => element.id));
      selectionStore.clear();
    });
  }

  function duplicateSelection() {
    if (selectedElements.length === 0) {
      return;
    }

    mutateScene(() => {
      const copies = selectedElements.map(cloneForDuplicate);
      sceneStore.setElements([...sceneStore.get().elements, ...copies]);
      selectionStore.setElementIds(copies.map((element) => element.id));
    });
  }

  function changeLayer(action: LayerAction) {
    if (selectedElements.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedElements.map((element) => element.id));
    mutateScene(() => {
      sceneStore.setElements(
        reorderElements(sceneStore.get().elements, selectedIds, action),
      );
    });
  }

  return (
    <>
      {!isCompactPanelOpen && (
        <button
          aria-label="Открыть настройки"
          className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-17 z-30 grid size-11 place-items-center rounded-xl border border-border bg-panel text-text shadow-panel transition-colors hover:bg-control lg:hidden"
          onClick={() => setIsCompactPanelOpen(true)}
          title="Настройки"
          type="button"
        >
          <Settings2 aria-hidden size={19} />
        </button>
      )}

      {isCompactPanelOpen && (
        <button
          aria-label="Закрыть настройки"
          className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsCompactPanelOpen(false)}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-x-2 scrollbar-none bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 max-h-[min(72dvh,34rem)] overflow-y-auto rounded-2xl border border-border bg-panel p-3 shadow-panel ${
          isCompactPanelOpen ? "max-lg:block" : "max-lg:hidden"
        } lg:absolute lg:right-4 lg:top-20 lg:z-20 lg:block lg:max-h-[calc(100dvh-13rem)] lg:w-[18rem] lg:rounded-xl`}
      >
        <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
          <SlidersHorizontal size={17} className="text-accent" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold text-text">{title}</p>
            <p className="m-0 text-xs text-text-muted">
              {primaryElement
                ? "Изменения применяются сразу"
                : "Стиль следующих объектов"}
            </p>
          </div>
          <button
            aria-label="Закрыть настройки"
            className="grid size-10 place-items-center rounded-lg text-text-muted transition-colors hover:bg-control hover:text-text lg:hidden"
            onClick={() => setIsCompactPanelOpen(false)}
            type="button"
          >
            <X aria-hidden size={19} />
          </button>
        </div>

        <div className="space-y-5">
          {(capabilities.stroke ||
            capabilities.fill ||
            capabilities.corner ||
            capabilities.opacity) && (
            <ToolStyleSection
              capabilities={capabilities}
              onChange={patchSelectedStyle}
              style={target.style}
            />
          )}

          {capabilities.arrowRouting && (
            <section className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <ArrowRightLeft size={16} /> Тип стрелки
              </div>
              <SegmentedControl<ArrowRouting>
                items={ARROW_ROUTING_ITEMS}
                label="Маршрут"
                onChange={changeArrowRouting}
                value={
                  primaryElement?.type === "arrow"
                    ? primaryElement.routing
                    : toolSettings.arrowRouting
                }
              />
              {primaryElement?.type === "arrow" &&
                primaryElement.routing === "elbow" && (
                  <button
                    className="w-full rounded-md border border-border bg-control px-2 py-2 text-xs text-text transition-colors hover:bg-surface-muted"
                    onClick={() =>
                      mutateScene(() => {
                        sceneStore.updateById(primaryElement.id, (element) =>
                          element.type === "arrow"
                            ? updateElement(element, {
                                elbowAxis:
                                  element.elbowAxis === "horizontal"
                                    ? "vertical"
                                    : "horizontal",
                              })
                            : element,
                        );
                      })
                    }
                    type="button"
                  >
                    Поменять направление сгиба
                  </button>
                )}
            </section>
          )}

          {capabilities.text && (
            <section className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <CaseSensitive size={18} /> Текст
              </div>
              <NumberField
                label="Размер шрифта"
                max={120}
                min={12}
                onChange={(fontSize) => changeTextOptions({ fontSize })}
                step={1}
                suffix="px"
                value={
                  primaryElement?.type === "text"
                    ? primaryElement.fontSize
                    : toolSettings.fontSize
                }
              />
              <SegmentedControl<TextAlign>
                items={TEXT_ALIGN_ITEMS}
                label="Выравнивание"
                onChange={(textAlign) => changeTextOptions({ textAlign })}
                value={
                  primaryElement?.type === "text"
                    ? primaryElement.textAlign
                    : toolSettings.textAlign
                }
              />
            </section>
          )}

          {!primaryElement && capabilities.snap && (
            <SnapSection
              checked={toolSettings.snapToGrid}
              onCheckedChange={(checked) =>
                toolSettingsStore.setSnapToGrid(activeTool, checked)
              }
              onSnapSizeChange={(snapSize) =>
                toolSettingsStore.setSnapSize(activeTool, snapSize)
              }
              snapSize={toolSettings.snapSize}
            />
          )}

          {primaryElement && (
            <>
              {primaryElement.type === "embed" && (
                <EmbedSection
                  url={primaryElement.url}
                  onChange={changeEmbedUrl}
                />
              )}
            </>
          )}

          {selectedElements.length > 0 && (
            <section className="space-y-3 border-t border-border pt-4">
              <p className="m-0 text-xs font-medium text-text-muted">
                Действия
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-control text-xs text-text transition-colors hover:bg-surface-muted"
                  onClick={duplicateSelection}
                  title="Дублировать выбранные объекты"
                  type="button"
                >
                  <Copy aria-hidden size={15} /> Копия
                </button>
                <button
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-red-500/15 text-xs text-red-300 transition-colors hover:bg-red-500/25"
                  onClick={deleteSelection}
                  title="Удалить выбранные объекты"
                  type="button"
                >
                  <Trash2 aria-hidden size={15} /> Удалить
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  aria-label="На задний слой"
                  className="grid h-9 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
                  onClick={() => changeLayer("back")}
                  title="На задний слой"
                  type="button"
                >
                  <SendToBack size={16} />
                </button>
                <button
                  aria-label="Ниже на один слой"
                  className="grid h-9 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
                  onClick={() => changeLayer("backward")}
                  title="Ниже на один слой"
                  type="button"
                >
                  <MoveDown size={16} />
                </button>
                <button
                  aria-label="Выше на один слой"
                  className="grid h-9 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
                  onClick={() => changeLayer("forward")}
                  title="Выше на один слой"
                  type="button"
                >
                  <MoveUp size={16} />
                </button>
                <button
                  aria-label="На передний слой"
                  className="grid h-9 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
                  onClick={() => changeLayer("front")}
                  title="На передний слой"
                  type="button"
                >
                  <BringToFront size={16} />
                </button>
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
