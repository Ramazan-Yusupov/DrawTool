import { useSyncExternalStore } from "react";
import { toolStore } from "@/entities/tool";
import { textEditorStore } from "@/features/edit-text";
import { EditingLockButton, editingLockStore } from "@/features/lock-editing";
import { cn } from "@/shared/lib";
import { Divider } from "@/shared/ui";
import { TOOL_ITEMS } from "../model/toolItems";
import { useActiveTool } from "../model/useActiveTool";
import { MoreToolsMenu } from "./MoreToolsMenu";
import { ToolButton } from "./ToolButton";

const GROUPS = ["core", "actions"] as const;
const TOOLBAR_CLASS_NAME =
  "drawtool-toolbar-scroll absolute left-1/2 top-4 z-20 flex max-w-[calc(100dvw-2rem)] -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel min-[1100px]:ms-45 sm:justify-center max-[1100px]:bottom-[max(0.5rem,env(safe-area-inset-bottom))] max-[1100px]:top-auto max-[1100px]:w-[calc(100dvw-1rem)] max-[1100px]:max-w-none max-[1100px]:overflow-x-auto max-[1100px]:overscroll-contain";

export function Toolbar() {
  const activeTool = useActiveTool();

  const textEditor = useSyncExternalStore(
    textEditorStore.subscribe,
    textEditorStore.get,
    textEditorStore.get,
  );

  const { isLocked } = useSyncExternalStore(
    editingLockStore.subscribe,
    editingLockStore.get,
    editingLockStore.get,
  );

  return (
    <nav
      aria-label="Инструменты доски"
      className={cn(
        TOOLBAR_CLASS_NAME,
        textEditor.elementId && "max-lg:hidden",
      )}
    >
      {GROUPS.map((group, groupIndex) => {
        const items = TOOL_ITEMS.filter((item) => item.group === group);

        if (items.length === 0) {
          return null;
        }

        return (
          <div className="flex shrink-0 items-center gap-1" key={group}>
            {groupIndex > 0 && (
              <Divider className="mx-0.5" orientation="vertical" />
            )}

            {items.map((item) => (
              <ToolButton
                disabled={isLocked && item.id !== "pan"}
                isActive={activeTool === item.id}
                item={item}
                key={item.id}
                onClick={() => toolStore.set(item.id)}
              />
            ))}
          </div>
        );
      })}

      <Divider className="mx-0.5" orientation="vertical" />

      <EditingLockButton />

      <Divider className="mx-0.5" orientation="vertical" />

      {!isLocked && <MoreToolsMenu />}
    </nav>
  );
}
