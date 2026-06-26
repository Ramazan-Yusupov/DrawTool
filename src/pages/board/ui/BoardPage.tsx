import { BoardShell } from "@/widgets/board-shell";

export function BoardPage() {
  return (
    <main
      aria-label="Рабочая область DrawTool"
      className="h-dvh w-dvw bg-(--color-canvas)"
    >
      <BoardShell />
    </main>
  );
}
