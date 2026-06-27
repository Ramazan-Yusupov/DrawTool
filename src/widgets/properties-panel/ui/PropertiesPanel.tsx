import { useEffect, useState, useSyncExternalStore } from "react";
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
  RotateCw,
  SendToBack,
  Settings2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib";
import {
  getElementRotation,
  getTextSize,
  updateElement,
} from "@/entities/element";
import type {
  ArrowRouting,
  BoardElement,
  ElementStyle,
  TextAlign,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { useDuplicateElements } from "@/features/duplicate-elements";
import {
  canChangeElementsLayer,
  reorderElementsByLayer,
  type LayerAction,
} from "@/features/change-layer";
import { expandFramesToFitChildren, sceneStore } from "@/entities/scene";
import { TOOL_LABELS } from "@/entities/tool";
import {
  ToolStyleSection,
  TOOL_SETTINGS_CAPABILITIES,
  toolSettingsStore,
} from "@/features/change-style";
import { Button, IconButton, NumberField, SegmentedControl } from "@/shared/ui";
import { useChangeStyle } from "@/features/change-style/model/useChangeStyle";
import { useDeleteElements } from "@/features/delete-elements";
import {
  degreesToRadians,
  setSelectedElementRotation,
} from "@/features/rotate-elements";
import { EmbedSection } from "./EmbedSection";
import { usePropertiesPanel } from "../model/usePropertiesPanel";

const ARROW_ROUTING_ITEMS = [
  {
    label: "Прямая стрелка",
    value: "straight",
    icon: ArrowRightLeft,
    iconOnly: true,
  },
  {
    label: "Сгибающаяся стрелка",
    value: "elbow",
    icon: Route,
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

export function PropertiesPanel() {
  const [isCompactPanelOpen, setIsCompactPanelOpen] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    function closeCompactPanelOnDesktop() {
      if (desktopQuery.matches) {
        setIsCompactPanelOpen(false);
      }
    }

    closeCompactPanelOnDesktop();
    desktopQuery.addEventListener("change", closeCompactPanelOnDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeCompactPanelOnDesktop);
    };
  }, []);

  const { activeTool, primaryElement, scene, selectedElements } =
    usePropertiesPanel();
  const changeSelectedStyle = useChangeStyle();
  const deleteSelection = useDeleteElements();
  const duplicateSelection = useDuplicateElements();

  const selectedElementIds = new Set(
    selectedElements.map((element) => element.id),
  );

  const settingsTool = primaryElement?.type ?? activeTool;

  const toolSettings = useSyncExternalStore(
    toolSettingsStore.subscribe,
    () => toolSettingsStore.get(settingsTool),
    () => toolSettingsStore.get(settingsTool),
  );

  const targetType = settingsTool;
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

  const canSendToBack = canChangeElementsLayer(
    scene.elements,
    selectedElementIds,
    "back",
  );
  const canMoveBackward = canChangeElementsLayer(
    scene.elements,
    selectedElementIds,
    "backward",
  );
  const canMoveForward = canChangeElementsLayer(
    scene.elements,
    selectedElementIds,
    "forward",
  );
  const canBringToFront = canChangeElementsLayer(
    scene.elements,
    selectedElementIds,
    "front",
  );

  function mutateScene(action: () => void) {
    historyStore.begin();
    action();
    historyStore.commit();
  }

  function patchSelectedStyle(patch: Partial<ElementStyle>) {
    if (selectedElements.length === 0) {
      toolSettingsStore.patchStyle(settingsTool, patch);
      return;
    }

    changeSelectedStyle(patch);
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

    toolSettingsStore.setArrowRouting(settingsTool, routing);
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

        const nextElements = expandFramesToFitChildren(
          sceneStore.get().elements,
        );

        if (nextElements !== sceneStore.get().elements) {
          sceneStore.setElements(nextElements);
        }
      });

      return;
    }

    toolSettingsStore.setTextOptions("text", {
      fontSize: patch.fontSize ?? toolSettings.fontSize,
      fontFamily: toolSettings.fontFamily,
      textAlign: patch.textAlign ?? toolSettings.textAlign,
    });
  }

  function changeLayer(action: LayerAction) {
    if (selectedElementIds.size === 0) {
      return;
    }

    const nextElements = reorderElementsByLayer(
      scene.elements,
      selectedElementIds,
      action,
    );

    // Do not create an empty history entry when the selected object is already
    // at the requested edge of its stacking context.
    if (nextElements === scene.elements) {
      return;
    }

    mutateScene(() => {
      sceneStore.setElements(nextElements);
    });
  }

  function getLayerButtonClass(isAvailable: boolean) {
    return cn(
      "grid h-9 place-items-center rounded-md transition-colors",
      isAvailable
        ? "bg-control text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        : "cursor-not-allowed bg-control/60 text-text-muted/50",
    );
  }

  return (
    <>
      {!isCompactPanelOpen && (
        <IconButton
          aria-label="Открыть настройки"
          className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-20 z-30 grid size-11 place-items-center rounded-xl border border-border bg-panel text-text shadow-panel transition-colors hover:bg-control lg:hidden"
          onClick={() => setIsCompactPanelOpen(true)}
          title="Настройки"
          type="button"
        >
          <Settings2 aria-hidden size={19} />
        </IconButton>
      )}

      {isCompactPanelOpen && (
        <Button
          aria-label="Закрыть настройки"
          className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsCompactPanelOpen(false)}
          type="button"
        />
      )}

      <aside
        className={cn(
          "fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-40 max-h-[min(72dvh,34rem)] overflow-y-auto rounded-2xl border border-border bg-panel p-3 shadow-panel scrollbar-none lg:absolute lg:right-4 lg:top-20 lg:z-20 lg:block lg:max-h-[calc(100dvh-13rem)] lg:w-[18rem] lg:rounded-xl",
          isCompactPanelOpen ? "max-lg:block" : "max-lg:hidden",
        )}
      >
        <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
          <SlidersHorizontal className="text-accent" size={17} />

          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold text-text">{title}</p>

            <p className="m-0 text-xs text-text-muted">
              {primaryElement
                ? "Изменения применяются сразу"
                : "Стиль следующих объектов"}
            </p>
          </div>

          <IconButton
            aria-label="Закрыть настройки"
            className="grid size-10 place-items-center rounded-lg text-text-muted transition-colors hover:bg-control hover:text-text lg:hidden"
            onClick={() => setIsCompactPanelOpen(false)}
            type="button"
          >
            <X aria-hidden size={19} />
          </IconButton>
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
                <ArrowRightLeft size={16} />
                Тип стрелки
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
                  <Button
                    className="mt-2 w-full rounded-md border border-border bg-control px-2 py-2 text-xs text-text transition-colors hover:bg-surface-muted"
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
                  </Button>
                )}
            </section>
          )}

          {capabilities.text && (
            <section className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <CaseSensitive size={18} />
                Текст
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

          {primaryElement?.type === "embed" && (
            <EmbedSection url={primaryElement.url} onChange={changeEmbedUrl} />
          )}

          {primaryElement && (
            <section className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <RotateCw size={17} />
                Поворот
              </div>

              <NumberField
                label="Угол"
                max={360}
                min={-360}
                onChange={(degrees) =>
                  setSelectedElementRotation(degreesToRadians(degrees))
                }
                step={1}
                suffix="°"
                value={Math.round(
                  (getElementRotation(primaryElement) * 180) / Math.PI,
                )}
              />
            </section>
          )}

          {selectedElements.length > 0 && (
            <section className="space-y-3 border-t border-border pt-4">
              <p className="m-0 text-xs font-medium text-text-muted">
                Действия
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-control text-xs text-text transition-colors hover:bg-surface-muted"
                  onClick={duplicateSelection}
                  title="Дублировать выбранные объекты"
                  type="button"
                >
                  <Copy aria-hidden size={15} />
                  Копия
                </Button>

                <Button
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-red-500/20 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/30 hover:text-red-700 active:scale-[0.98] active:bg-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                  onClick={deleteSelection}
                  title="Удалить выбранные объекты"
                  type="button"
                >
                  <Trash2 aria-hidden size={15} />
                  Удалить
                </Button>
              </div>

              <p className="m-0 pt-1 text-xs font-medium text-text-muted">
                Порядок слоёв
              </p>

              <div className="grid grid-cols-4 gap-1">
                <IconButton
                  aria-label="На задний слой"
                  className={getLayerButtonClass(canSendToBack)}
                  disabled={!canSendToBack}
                  onClick={() => changeLayer("back")}
                  title="Поместить под все объекты этого слоя"
                  type="button"
                >
                  <SendToBack size={16} />
                </IconButton>

                <IconButton
                  aria-label="Ниже на один слой"
                  className={getLayerButtonClass(canMoveBackward)}
                  disabled={!canMoveBackward}
                  onClick={() => changeLayer("backward")}
                  title="Переместить на один слой ниже"
                  type="button"
                >
                  <MoveDown size={16} />
                </IconButton>

                <IconButton
                  aria-label="Выше на один слой"
                  className={getLayerButtonClass(canMoveForward)}
                  disabled={!canMoveForward}
                  onClick={() => changeLayer("forward")}
                  title="Переместить на один слой выше"
                  type="button"
                >
                  <MoveUp size={16} />
                </IconButton>

                <IconButton
                  aria-label="На передний слой"
                  className={getLayerButtonClass(canBringToFront)}
                  disabled={!canBringToFront}
                  onClick={() => changeLayer("front")}
                  title="Поместить поверх всех объектов этого слоя"
                  type="button"
                >
                  <BringToFront size={16} />
                </IconButton>
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}
