import { BoardShell } from "@/widgets/board-shell";
import { useBoardLifecycle } from "../model/useBoardLifecycle";

export function BoardPage() {
  useBoardLifecycle();

  return (
    <main
      aria-label="Рабочая область DrawTool"
      className="h-dvh w-dvw bg-canvas"
    >
      <BoardShell />
    </main>
  );
}
