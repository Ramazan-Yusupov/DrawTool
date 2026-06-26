import { useRef, useSyncExternalStore } from "react";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { TOOL_SETTINGS_CAPABILITIES } from "@/features/change-style";
import { TextEditorOverlay } from "@/features/edit-text";
import { GenerateDialog } from "@/features/generate";
import { SceneStorageControls } from "@/features/save-scene";
import { ThemeToggle } from "@/features/toggle-theme";
import { UndoRedoButtons } from "@/features/undo-redo";
import { PropertiesPanel } from "@/widgets/properties-panel";
import { Toolbar } from "@/widgets/toolbar";
import { BoardCanvas } from "./BoardCanvas";
import { useBoardRenderer } from "../model/useBoardRenderer";

const UTILITY_TOOLS_WITHOUT_PROPERTIES = new Set([
  "eraser",
  "laser",
  "lasso",
]);

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
  const toolCapabilities = TOOL_SETTINGS_CAPABILITIES[activeTool];
  const toolHasSettings = Object.values(toolCapabilities).some(Boolean);

  /*
   * Ластик, лазер и лассо не имеют настраиваемого стиля, поэтому не
   * показываем пустую панель даже когда до этого был выделен объект.
   * Для остальных инструментов панель появляется во время создания,
   * а для V — только когда есть выбранный объект.
   */
  const shouldShowProperties =
    !UTILITY_TOOLS_WITHOUT_PROPERTIES.has(activeTool) &&
    (hasSelectedElements || (activeTool !== "selection" && toolHasSettings));

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
