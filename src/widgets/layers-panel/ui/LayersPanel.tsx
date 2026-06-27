import { Panel } from "@/shared/ui";
import { useLayersPanel } from "../model/useLayersPanel";
import { LayerRow } from "./LayerRow";

/** Optional scene-order panel. It is exported but not mounted until the UI needs it. */
export function LayersPanel() {
  const { layers, selectLayer, selectedIds } = useLayersPanel();
  return <Panel className="w-64 rounded-xl border border-border bg-panel p-2 shadow-panel"><p className="m-2 text-sm font-semibold text-text">Слои</p><div className="max-h-80 space-y-1 overflow-y-auto">{layers.map((layer) => <LayerRow isSelected={selectedIds.includes(layer.element.id)} key={layer.element.id} layer={layer} onSelect={selectLayer} />)}</div></Panel>;
}
