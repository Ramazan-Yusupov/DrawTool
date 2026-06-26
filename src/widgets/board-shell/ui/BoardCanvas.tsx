import { useDrawShape } from "@/features/draw-shape";
import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";

type BoardCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const panEvents = useCanvasPointerEvents();
  const drawingEvents = useDrawShape();

  useCanvasWheel(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className="size-full touch-none"
      onPointerDown={(event) => {
        panEvents.onPointerDown(event);
        drawingEvents.onPointerDown(event);
      }}
      onPointerMove={(event) => {
        panEvents.onPointerMove(event);
        drawingEvents.onPointerMove(event);
      }}
      onPointerUp={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerUp(event);
      }}
      onPointerCancel={(event) => {
        panEvents.onPointerUp(event);
        drawingEvents.onPointerCancel(event);
      }}
    />
  );
}
