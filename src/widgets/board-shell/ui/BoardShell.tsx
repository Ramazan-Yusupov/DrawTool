import { useRef, useState, useSyncExternalStore } from "react";
import { selectionStore } from "@/entities/selection";
import { toolStore } from "@/entities/tool";
import {
  TOOL_SETTINGS_CAPABILITIES,
  ToolSettingsModal,
} from "@/features/change-style";
import { TextEditorOverlay } from "@/features/edit-text";
import { StickerPickerModal } from "@/features/add-sticker";
import { GenerateDialog } from "@/features/generate";
import { AiAssistantDialog } from "@/features/ai-assistant";
import { CommandPalette } from "@/features/command-palette";
import { editingLockStore } from "@/features/lock-editing";
import { PremiumStudioDialog } from "@/features/premium-studio";
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
import { BoardSelectionFrame } from "./BoardSelectionFrame";
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
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isPremiumStudioOpen, setIsPremiumStudioOpen] = useState(false);
  const [isToolSettingsOpen, setIsToolSettingsOpen] = useState(false);

  useBoardRenderer(canvasRef);

  const activeTool = useSyncExternalStore(
    toolStore.subscribe,
    toolStore.get,
    toolStore.get,
  );

  const selectedElementIds = useSyncExternalStore(
    selectionStore.subscribeElementIds,
    () => selectionStore.get().elementIds,
    () => selectionStore.get().elementIds,
  );

  const { isLocked } = useSyncExternalStore(
    editingLockStore.subscribe,
    editingLockStore.get,
    editingLockStore.get,
  );

  const hasSelectedElements = selectedElementIds.length > 0;
  const toolCapabilities = TOOL_SETTINGS_CAPABILITIES[activeTool];
  const toolHasSettings = Object.values(toolCapabilities).some(Boolean);

  const shouldShowProperties =
    !isLocked &&
    !UTILITY_TOOLS_WITHOUT_PROPERTIES.has(activeTool) &&
    (hasSelectedElements || (activeTool !== "selection" && toolHasSettings));

  return (
    <section className="relative size-full overflow-hidden bg-canvas">
      <BoardCanvas canvasRef={canvasRef} />
      <BoardSelectionFrame />

      <TextEditorOverlay />
      <StickerPickerModal />
      <GenerateDialog />
      <AiAssistantDialog
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
      <PremiumStudioDialog
        isOpen={isPremiumStudioOpen}
        onClose={() => setIsPremiumStudioOpen(false)}
        onOpenAi={() => {
          setIsPremiumStudioOpen(false);
          setIsAiOpen(true);
        }}
      />
      <CommandPalette
        onOpenAi={() => setIsAiOpen(true)}
        onOpenPremiumStudio={() => setIsPremiumStudioOpen(true)}
      />
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
        onOpenPremiumStudio={() => setIsPremiumStudioOpen(true)}
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
