import { Redo2, Undo2 } from "lucide-react";
import { useUndoRedo } from "../model/useUndoRedo";

export function UndoRedoButtons() {
  const { canRedo, canUndo, redo, undo } = useUndoRedo();

  return (
    <div className="absolute left-4 top-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-lg:left-[max(0.5rem,env(safe-area-inset-left))] max-lg:top-[max(0.5rem,env(safe-area-inset-top))]">
      <button
        aria-label="Отменить последнее действие"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control disabled:cursor-not-allowed disabled:opacity-35"
        disabled={!canUndo}
        onClick={undo}
        title="Отменить (Ctrl/Cmd + Z)"
        type="button"
      >
        <Undo2 aria-hidden size={18} />
      </button>
      <button
        aria-label="Повторить действие"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control disabled:cursor-not-allowed disabled:opacity-35"
        disabled={!canRedo}
        onClick={redo}
        title="Повторить (Ctrl/Cmd + Shift + Z)"
        type="button"
      >
        <Redo2 aria-hidden size={18} />
      </button>
    </div>
  );
}
