import { useSyncExternalStore } from "react";
import { toolStore } from "@/entities/tool";
import { TOOL_ITEMS } from "../model/toolItems";
import { MoreToolsMenu } from "./MoreToolsMenu";
import { ToolButton } from "./ToolButton";

const GROUPS = ["core", "actions"] as const;

export function Toolbar() {
  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  return (
    <nav
      aria-label="Инструменты доски"
      className="absolute left-1/2 top-4 z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel"
    >
      {GROUPS.map((group, groupIndex) => {
        const items = TOOL_ITEMS.filter((item) => item.group === group);
        if (items.length === 0) return null;

        return (
          <div className="flex items-center gap-1" key={group}>
            {groupIndex > 0 && <span className="mx-0.5 h-7 w-px bg-border" />}
            {items.map((item) => (
              <ToolButton
                isActive={activeTool === item.id}
                item={item}
                key={item.id}
                onClick={() => toolStore.set(item.id)}
              />
            ))}
          </div>
        );
      })}
      <span className="mx-0.5 h-7 w-px bg-border" />
      <MoreToolsMenu />
    </nav>
  );
}
