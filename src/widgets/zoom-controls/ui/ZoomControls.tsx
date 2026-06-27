import { Minus, Plus, RotateCcw } from "lucide-react";
import { IconButton, Panel } from "@/shared/ui";
import { useZoomControls } from "../model/useZoomControls";
import { ZoomValue } from "./ZoomValue";

/** Compact optional zoom-control panel; intentionally not mounted by default. */
export function ZoomControls() {
  const { resetZoom, zoom, zoomIn, zoomOut } = useZoomControls();
  return (
    <Panel className="flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel">
      <IconButton aria-label="Уменьшить масштаб" className="grid size-8 place-items-center rounded-lg hover:bg-control" onClick={zoomOut}><Minus size={16} /></IconButton>
      <ZoomValue zoom={zoom} />
      <IconButton aria-label="Увеличить масштаб" className="grid size-8 place-items-center rounded-lg hover:bg-control" onClick={zoomIn}><Plus size={16} /></IconButton>
      <IconButton aria-label="Сбросить масштаб" className="grid size-8 place-items-center rounded-lg hover:bg-control" onClick={resetZoom}><RotateCcw size={15} /></IconButton>
    </Panel>
  );
}
