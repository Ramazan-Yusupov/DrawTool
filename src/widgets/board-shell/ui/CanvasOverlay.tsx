import { useCallback, useSyncExternalStore } from "react";
import { TOOL_LABELS, toolStore } from "@/entities/tool";
import { toolSettingsStore } from "@/features/change-style";

export function CanvasOverlay() {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );
  const getSettings = useCallback(
    () => toolSettingsStore.get(activeTool),
    [activeTool],
  );
  const settings = useSyncExternalStore(
    toolSettingsStore.subscribe,
    getSettings,
    getSettings,
  );

  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs text-text-muted shadow-panel">
      <p className="m-0">{TOOL_LABELS[activeTool]}</p>
      <p className="m-0">
        Привязка: {settings.snapToGrid ? `${settings.snapSize}px` : "выкл."}
      </p>
      <p className="m-0">Shift — пропорции · Ctrl + колесо — масштаб</p>
      <p className="m-0">Delete — удалить · Двойной клик — текст</p>
    </aside>
  );
}
