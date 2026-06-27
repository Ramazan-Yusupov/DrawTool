import { useEffect, useRef } from "react";
import type { BoardElement } from "@/entities/element";
import { cn } from "@/shared/lib";
import { renderPreview } from "../lib/renderPreview";

type ShapePreviewProps = { className?: string; element: BoardElement; size?: number };

/** Small isolated canvas preview for gallery items and future templates. */
export function ShapePreview({ className, element, size = 72 }: ShapePreviewProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => { const canvas = ref.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return; context.clearRect(0, 0, size, size); renderPreview(context, element); }, [element, size]);
  return <canvas aria-label={`Предпросмотр: ${element.type}`} className={cn("block", className)} height={size} ref={ref} width={size} />;
}
