import { useCallback, useSyncExternalStore } from "react";
import { TOOL_LABELS, toolStore } from "@/entities/tool";
import { toolSettingsStore } from "@/features/change-style";

export function CanvasOverlay() {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  const getSettingsSnapshot = useCallback(
    () => toolSettingsStore.get(activeTool),
    [activeTool],
  );

  const settings = useSyncExternalStore(
    toolSettingsStore.subscribe,
    getSettingsSnapshot,
    getSettingsSnapshot,
  );

  const snapLabel = settings.snapToGrid
    ? `${settings.snapSize}px`
    : "выключена";

  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-muted shadow-panel">
      <p className="m-0">Инструмент: {TOOL_LABELS[activeTool]}</p>
      <p className="m-0">Привязка: {snapLabel}</p>
      <p className="m-0">R — прямоугольник</p>
      <p className="m-0">Shift + ЛКМ — квадрат</p>
      <p className="m-0">Ctrl + колесо — масштаб</p>
    </aside>
  );
}
