import { useCallback, useSyncExternalStore } from "react";
import { ArrowRightLeft, CaseSensitive, SlidersHorizontal } from "lucide-react";
import { getTextSize, updateElement } from "@/entities/element";
import type { ArrowRouting, BoardElement, ElementStyle, TextAlign } from "@/entities/element";
import { sceneStore } from "@/entities/scene";
import { getSelectedElements, selectionStore } from "@/entities/selection";
import { TOOL_LABELS, toolStore } from "@/entities/tool";
import { SnapSection, ToolStyleSection, TOOL_SETTINGS_CAPABILITIES, toolSettingsStore } from "@/features/change-style";
import { NumberField, SegmentedControl } from "@/shared/ui";
import { GeometrySection } from "./GeometrySection";

const ARROW_ROUTING_ITEMS = [
  { label: "Прямая", value: "straight" },
  { label: "Сгиб", value: "elbow" },
] as const;

const TEXT_ALIGN_ITEMS = [
  { label: "Слева", value: "left" },
  { label: "Центр", value: "center" },
  { label: "Справа", value: "right" },
] as const;

type StyleTarget = {
  style: ElementStyle;
  type: BoardElement["type"] | "tool";
};

export function PropertiesPanel() {
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
  const primaryElement = selectedElements.length === 1 ? selectedElements[0] : null;
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

  function patchSelectedStyle(patch: Partial<ElementStyle>) {
    if (selectedElements.length === 0) {
      toolSettingsStore.patchStyle(activeTool, patch);
      return;
    }

    const selectedIds = new Set(selectedElements.map((element) => element.id));
    sceneStore.updateAll((element) =>
      selectedIds.has(element.id)
        ? updateElement(element, { style: { ...element.style, ...patch } })
        : element,
    );
  }

  function changeGeometry(patch: Pick<BoardElement, "x" | "y" | "width" | "height">) {
    if (!primaryElement) {
      return;
    }

    sceneStore.updateById(primaryElement.id, (element) =>
      updateElement(element, patch),
    );
  }

  function changeArrowRouting(routing: ArrowRouting) {
    if (primaryElement?.type === "arrow") {
      sceneStore.updateById(primaryElement.id, (element) =>
        element.type === "arrow"
          ? updateElement(element, {
              routing,
              elbowAxis: routing === "elbow" ? element.elbowAxis : element.elbowAxis,
            })
          : element,
      );
      return;
    }

    toolSettingsStore.setArrowRouting(activeTool, routing);
  }

  function changeTextOptions(patch: {
    fontSize?: number;
    textAlign?: TextAlign;
  }) {
    if (primaryElement?.type === "text") {
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

        return updateElement(element, { ...patch, width: size.width, height: size.height });
      });
      return;
    }

    toolSettingsStore.setTextOptions("text", {
      fontSize: patch.fontSize ?? toolSettings.fontSize,
      fontFamily: toolSettings.fontFamily,
      textAlign: patch.textAlign ?? toolSettings.textAlign,
    });
  }

  return (
    <aside className="absolute right-4 top-20 z-20 max-h-[calc(100dvh-7rem)] w-[18rem] overflow-y-auto rounded-xl border border-border bg-panel p-3 shadow-panel">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <SlidersHorizontal size={17} className="text-accent" />
        <div>
          <p className="m-0 text-sm font-semibold text-text">{title}</p>
          <p className="m-0 text-xs text-text-muted">
            {primaryElement
              ? "Изменения применяются сразу"
              : "Стиль следующих объектов"}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {(capabilities.stroke || capabilities.fill || capabilities.corner || capabilities.opacity) && (
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
            {primaryElement?.type === "arrow" && primaryElement.routing === "elbow" && (
              <button
                className="w-full rounded-md border border-border bg-control px-2 py-2 text-xs text-text transition-colors hover:bg-surface-muted"
                onClick={() =>
                  sceneStore.updateById(primaryElement.id, (element) =>
                    element.type === "arrow"
                      ? updateElement(element, {
                          elbowAxis:
                            element.elbowAxis === "horizontal"
                              ? "vertical"
                              : "horizontal",
                        })
                      : element,
                  )
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
          <GeometrySection element={primaryElement} onChange={changeGeometry} />
        )}
      </div>
    </aside>
  );
}
