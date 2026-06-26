import { useRef } from "react";
import { PropertiesPanel } from "@/widgets/properties-panel";
import { Toolbar } from "@/widgets/toolbar";
import { BoardCanvas } from "./BoardCanvas";
import { CanvasOverlay } from "./CanvasOverlay";
import { useBoardRenderer } from "../model/useBoardRenderer";

export function BoardShell() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useBoardRenderer(canvasRef);

  return (
    <section className="relative size-full overflow-hidden">
      <BoardCanvas canvasRef={canvasRef} />
      <Toolbar />
      <PropertiesPanel />
      <CanvasOverlay />
    </section>
  );
}
