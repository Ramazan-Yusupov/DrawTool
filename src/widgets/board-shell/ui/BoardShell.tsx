import { useRef, useSyncExternalStore } from "react";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { TextEditorOverlay } from "@/features/edit-text";
import { GenerateDialog } from "@/features/generate";
import { SceneStorageControls } from "@/features/save-scene";
import { ThemeToggle } from "@/features/toggle-theme";
import { UndoRedoButtons } from "@/features/undo-redo";
import { PropertiesPanel } from "@/widgets/properties-panel";
import { Toolbar } from "@/widgets/toolbar";
import { BoardCanvas } from "./BoardCanvas";
import { useBoardRenderer } from "../model/useBoardRenderer";

export function BoardShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useBoardRenderer(canvasRef);

  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  const selection = useSyncExternalStore(
    selectionStore.subscribe,
    selectionStore.get,
    selectionStore.get,
  );

  const hasSelectedElements = selection.elementIds.length > 0;

  const shouldShowProperties =
    activeTool !== "selection" || hasSelectedElements;

  return (
    <section className="relative size-full overflow-hidden">
      <BoardCanvas canvasRef={canvasRef} />

      <TextEditorOverlay />
      <GenerateDialog />

      <UndoRedoButtons />
      <SceneStorageControls />
      <Toolbar />
      <ThemeToggle />

      {shouldShowProperties && <PropertiesPanel />}
    </section>
  );
}
