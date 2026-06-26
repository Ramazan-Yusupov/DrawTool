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
      className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel"
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
