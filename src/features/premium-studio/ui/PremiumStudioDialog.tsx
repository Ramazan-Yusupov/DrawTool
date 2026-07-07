import { useSyncExternalStore, useState } from "react";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { boardActions } from "@/features/board-actions";
import { Button, Modal } from "@/shared/ui";

type PremiumStudioDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenAi: () => void;
};

export function PremiumStudioDialog({
  isOpen,
  onClose,
  onOpenAi,
}: PremiumStudioDialogProps) {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const scene = useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
  const selection = useSyncExternalStore(
    selectionStore.subscribeElementIds,
    selectionStore.get,
    selectionStore.get,
  );
  const selected = scene.elements.filter((element) =>
    selection.elementIds.includes(element.id),
  );

  const buttonClass = "rounded-lg bg-control px-3 py-2 text-left text-sm text-text hover:bg-control/80";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Premium Studio">
      <div className="space-y-5 text-sm">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-muted">Inspector</h3>
          <div className="rounded-lg border border-border bg-surface-muted p-3 text-xs">
            <p>Scene elements: {scene.elements.length}</p>
            <p>Selected: {selected.length}</p>
            <p>Locked: {scene.elements.filter((element) => element.locked).length}</p>
            <p>Groups: {new Set(scene.elements.map((element) => element.groupId).filter(Boolean)).size}</p>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-muted">Templates</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button className={buttonClass} onClick={() => boardActions.insertTemplate("flowchart")}>Flowchart</Button>
            <Button className={buttonClass} onClick={() => boardActions.insertTemplate("mindmap")}>Mind map</Button>
            <Button className={buttonClass} onClick={() => boardActions.insertTemplate("roadmap")}>Roadmap</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-muted">Quality</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button className={buttonClass} onClick={() => setDiagnostics(boardActions.runDiagramDiagnostics())}>Run diagnostics</Button>
            <Button className={buttonClass} onClick={() => boardActions.applyBrandKit()}>Apply brand kit</Button>
            <Button className={buttonClass} onClick={() => boardActions.createSnapshot("Checkpoint")}>Create checkpoint</Button>
            <Button className={buttonClass} onClick={() => boardActions.restoreLatestSnapshot()}>Restore checkpoint</Button>
          </div>
          {diagnostics.length > 0 && (
            <ul className="mt-2 rounded-lg border border-border bg-canvas p-3 text-xs">
              {diagnostics.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-muted">AI</h3>
          <Button className="w-full rounded-lg bg-accent px-3 py-2 text-left text-sm text-white" onClick={onOpenAi}>
            Open AI Studio
          </Button>
        </section>
      </div>
    </Modal>
  );
}
