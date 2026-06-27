import { useRef, useState, useSyncExternalStore } from "react";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import { viewportStore, worldToScreen } from "@/entities/viewport";
import {
  TOOL_SETTINGS_CAPABILITIES,
  ToolSettingsModal,
} from "@/features/change-style";
import { TextEditorOverlay } from "@/features/edit-text";
import { StickerPickerModal } from "@/features/add-sticker";
import { GenerateDialog } from "@/features/generate";
import { editingLockStore } from "@/features/lock-editing";
import { ProjectsSidebar } from "@/features/projects";
import { SceneStorageControls } from "@/features/save-scene";
import { ShortcutsDialog } from "@/features/shortcuts-help";
import { ThemeToggle } from "@/features/toggle-theme";
import { UndoRedoButtons } from "@/features/undo-redo";
import { LayersPanel } from "@/widgets/layers-panel";
import { PropertiesPanel } from "@/widgets/properties-panel";
import { Toolbar } from "@/widgets/toolbar";
import { ZoomControls } from "@/widgets/zoom-controls";
import { Minimap } from "@/widgets/minimap";
import { BoardCanvas } from "./BoardCanvas";
import { SelectionFrame } from "./SelectionFrame";
import { useBoardRenderer } from "../model/useBoardRenderer";

const UTILITY_TOOLS_WITHOUT_PROPERTIES = new Set([
  "pan",
  "eraser",
  "laser",
  "lasso",
]);

export function BoardShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isToolSettingsOpen, setIsToolSettingsOpen] = useState(false);

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

  const viewport = useSyncExternalStore(
    viewportStore.subscribe,
    viewportStore.get,
    viewportStore.get,
  );

  const { isLocked } = useSyncExternalStore(
    editingLockStore.subscribe,
    editingLockStore.get,
    editingLockStore.get,
  );

  const hasSelectedElements = selection.elementIds.length > 0;
  const toolCapabilities = TOOL_SETTINGS_CAPABILITIES[activeTool];
  const toolHasSettings = Object.values(toolCapabilities).some(Boolean);

  const shouldShowProperties =
    !isLocked &&
    !UTILITY_TOOLS_WITHOUT_PROPERTIES.has(activeTool) &&
    (hasSelectedElements || (activeTool !== "selection" && toolHasSettings));

  const selectionBox = selection.selectionBox;
  const selectionBoxRect = selectionBox
    ? {
        ...worldToScreen({ x: selectionBox.x, y: selectionBox.y }, viewport),
        height: selectionBox.height * viewport.zoom,
        width: selectionBox.width * viewport.zoom,
      }
    : null;

  return (
    <section className="relative size-full overflow-hidden">
      <BoardCanvas canvasRef={canvasRef} />

      {selectionBoxRect && (
        <SelectionFrame
          className="border-dashed border-accent bg-accent/10"
          rect={selectionBoxRect}
        />
      )}

      <TextEditorOverlay />
      <StickerPickerModal />
      <GenerateDialog />
      <ShortcutsDialog />
      <ToolSettingsModal
        isOpen={isToolSettingsOpen}
        onClose={() => setIsToolSettingsOpen(false)}
      />
      <ProjectsSidebar />

      <UndoRedoButtons />
      <SceneStorageControls
        isLayersOpen={isLayersOpen}
        onOpenToolSettings={() => setIsToolSettingsOpen(true)}
        onToggleLayers={() => setIsLayersOpen((open) => !open)}
      />
      <Toolbar />
      <ThemeToggle />
      <Minimap />

      <div className="absolute bottom-4 right-4 z-20 max-[1100px]:bottom-20">
        <ZoomControls />
      </div>

      {isLayersOpen && (
        <div className="absolute left-4 top-20 z-30 max-lg:left-[max(0.5rem,env(safe-area-inset-left))] max-lg:top-34">
          <LayersPanel onClose={() => setIsLayersOpen(false)} />
        </div>
      )}

      {shouldShowProperties && <PropertiesPanel />}
    </section>
  );
}
