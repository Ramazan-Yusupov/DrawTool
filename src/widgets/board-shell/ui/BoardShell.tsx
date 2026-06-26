import { useRef } from "react";
import { TextEditorOverlay } from "@/features/edit-text";
import { ThemeToggle } from "@/features/toggle-theme";
import { GenerateDialog } from "@/features/generate";
import { UndoRedoButtons } from "@/features/undo-redo";
import { PropertiesPanel } from "@/widgets/properties-panel";
import { Toolbar } from "@/widgets/toolbar";
import { BoardCanvas } from "./BoardCanvas";
import { useBoardRenderer } from "../model/useBoardRenderer";

export function BoardShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useBoardRenderer(canvasRef);

  return (
    <section className="relative size-full overflow-hidden">
      <BoardCanvas canvasRef={canvasRef} />
      <TextEditorOverlay />
      <GenerateDialog />
      <UndoRedoButtons />
      <Toolbar />
      <ThemeToggle />
      <PropertiesPanel />
    </section>
  );
}
