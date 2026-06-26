import { useCanvasPointerEvents } from "../model/useCanvasPointerEvents";
import { useCanvasWheel } from "../model/useCanvasWheel";

type BoardCanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function BoardCanvas({ canvasRef }: BoardCanvasProps) {
  const pointerEvents = useCanvasPointerEvents();

  useCanvasWheel(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Интерактивная доска"
      className="size-full touch-none"
      {...pointerEvents}
    />
  );
}
