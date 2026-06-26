import { useSyncExternalStore } from "react";
import { toolStore } from "@/entities/tool";
import { textEditorStore } from "@/features/edit-text";
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
  const textEditor = useSyncExternalStore(
    textEditorStore.subscribe,
    textEditorStore.get,
    textEditorStore.get,
  );

  return (
    <nav
      aria-label="Инструменты доски"
      className={`drawtool-toolbar-scroll absolute left-1/2 top-4 z-20 lg:ms-10 flex max-w-[calc(100dvw-2rem)] -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-lg:bottom-[max(0.5rem,env(safe-area-inset-bottom))] max-lg:top-auto max-lg:w-[calc(100dvw-1rem)] max-lg:max-w-none max-lg:overflow-x-auto max-lg:overscroll-contain ${
        textEditor.elementId ? "max-lg:hidden" : ""
      }`}
    >
      {GROUPS.map((group, groupIndex) => {
        const items = TOOL_ITEMS.filter((item) => item.group === group);
        if (items.length === 0) return null;

        return (
          <div className="flex shrink-0 items-center gap-1" key={group}>
            {groupIndex > 0 && (
              <span className="mx-0.5 h-7 w-px shrink-0 bg-border" />
            )}
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
      <span className="mx-0.5 h-7 w-px shrink-0 bg-border" />
      <MoreToolsMenu />
    </nav>
  );
}
