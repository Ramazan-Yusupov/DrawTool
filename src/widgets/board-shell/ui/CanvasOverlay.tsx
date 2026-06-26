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

  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-panel/95 px-3 py-2 text-xs leading-5 text-text-muted shadow-panel backdrop-blur">
      <p className="m-0 text-text">{TOOL_LABELS[activeTool]}</p>
      <p className="m-0">Привязка: {settings.snapToGrid ? `${settings.snapSize}px` : "выкл."}</p>
      <p className="m-0">Кружок над объектом — поворот · Ctrl — привязка при resize</p>
      <p className="m-0">Shift — пропорции · Alt — от центра · Delete — удалить</p>
      <p className="m-0">Ctrl/Cmd + Z — отмена · F — фрейм · K — лазер · Q — лассо</p>
    </aside>
  );
}
