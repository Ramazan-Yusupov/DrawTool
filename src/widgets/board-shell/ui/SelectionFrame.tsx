import { cn } from "@/shared/lib";
import type { Rect } from "@/shared/types";

type SelectionFrameProps = { className?: string; rect: Rect };

/** DOM selection outline for future non-canvas overlays. */
export function SelectionFrame({ className, rect }: SelectionFrameProps) {
  return <div aria-hidden className={cn("pointer-events-none absolute border-2 border-accent", className)} style={{ height: rect.height, left: rect.x, top: rect.y, width: rect.width }} />;
}
