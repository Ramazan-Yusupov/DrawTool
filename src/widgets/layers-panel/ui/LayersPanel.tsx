import { Layers3, X } from "lucide-react";
import { IconButton, Panel } from "@/shared/ui";
import { useLayersPanel } from "../model/useLayersPanel";
import { LayerRow } from "./LayerRow";

type LayersPanelProps = {
  onClose?: () => void;
};

/** Scene-order panel for selecting elements by their visual stacking order. */
export function LayersPanel({ onClose }: LayersPanelProps) {
  const { count, isSelected, layers, selectLayer } = useLayersPanel();

  return (
    <Panel className="w-64 rounded-2xl border border-border/90 bg-panel/94 p-2 shadow-panel backdrop-blur-xl">
      <header className="flex items-center justify-between gap-2 px-2 py-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-text">
          <Layers3 className="text-accent" size={17} />
          Слои
          <span className="text-xs font-normal text-text-muted">{count}</span>
        </div>
        {onClose && (
          <IconButton
            aria-label="Закрыть слои"
            className="grid size-8 place-items-center rounded-md text-text-muted hover:bg-control hover:text-text"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={16} />
          </IconButton>
        )}
      </header>
      <div className="max-h-80 space-y-1 overflow-y-auto p-1">
        {layers.length > 0 ? (
          layers.map((layer) => (
            <LayerRow
              isSelected={isSelected(layer.element.id)}
              key={layer.element.id}
              layer={layer}
              onSelect={selectLayer}
            />
          ))
        ) : (
          <p className="m-2 text-sm text-text-muted">На доске пока нет объектов.</p>
        )}
      </div>
    </Panel>
  );
}
