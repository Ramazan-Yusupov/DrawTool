import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";

type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  isOpen: boolean;
};

/**
 * Lightweight content shell. Positioning and portal ownership stay with the
 * feature that owns the trigger, keeping responsive menu behavior unchanged.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, className, isOpen, ...props }, ref) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-panel p-2 shadow-panel",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Popover.displayName = "Popover";
