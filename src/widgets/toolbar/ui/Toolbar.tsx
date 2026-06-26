import { useSyncExternalStore } from "react";
import { toolStore } from "@/entities/tool";
import { TOOL_ITEMS } from "../model/toolItems";
import { ToolButton } from "./ToolButton";

export function Toolbar() {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  return (
    <nav
      aria-label="Инструменты доски"
      className="absolute left-4 top-4 z-20 flex max-w-[calc(100vw-2rem)] flex-wrap gap-1 rounded-lg border border-border bg-surface p-1 shadow-panel"
    >
      {TOOL_ITEMS.map((item) => (
        <ToolButton
          isActive={activeTool === item.id}
          item={item}
          key={item.id}
          onClick={() => toolStore.set(item.id)}
        />
      ))}
    </nav>
  );
}
