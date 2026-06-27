import type { ReactNode } from "react";
import { cn } from "@/shared/lib";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  side?: "bottom" | "left" | "right" | "top";
};

const SIDE_CLASS_NAMES = {
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
} as const;

/**
 * Optional CSS-only tooltip primitive for future controls.
 * Existing title attributes are intentionally untouched in this refactor.
 */
export function Tooltip({
  children,
  content,
  className,
  side = "top",
}: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        className={cn(
          "pointer-events-none absolute z-60 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-1 text-xs text-text opacity-0 shadow-panel transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          SIDE_CLASS_NAMES[side],
        )}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}
