import { useSyncExternalStore } from "react";
import { Redo2, Undo2 } from "lucide-react";
import { editingLockStore } from "@/features/lock-editing";
import { useUndoRedo } from "../model/useUndoRedo";

export function UndoRedoButtons() {
  const { canRedo, canUndo, redo, undo } = useUndoRedo();

  const { isLocked } = useSyncExternalStore(
    editingLockStore.subscribe,
    editingLockStore.get,
    editingLockStore.get,
  );

  return (
    <div className="absolute left-4 sm:top-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-lg:left-[max(0.5rem,env(safe-area-inset-left))] max-lg:top-[max(0.5rem,env(safe-area-inset-top))]">
      <button
        aria-label="Отменить последнее действие"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control disabled:cursor-not-allowed disabled:opacity-35"
        disabled={isLocked || !canUndo}
        onClick={undo}
        title={
          isLocked
            ? "Редактирование заблокировано"
            : "Отменить (Ctrl/Cmd + Z)"
        }
        type="button"
      >
        <Undo2 aria-hidden size={18} />
      </button>
      <button
        aria-label="Повторить действие"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control disabled:cursor-not-allowed disabled:opacity-35"
        disabled={isLocked || !canRedo}
        onClick={redo}
        title={
          isLocked
            ? "Редактирование заблокировано"
            : "Повторить (Ctrl/Cmd + Shift + Z)"
        }
        type="button"
      >
        <Redo2 aria-hidden size={18} />
      </button>
    </div>
  );
}
