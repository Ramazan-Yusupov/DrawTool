import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

/**
 * Neutral panel container. Styling is intentionally supplied by callers to
 * preserve the current layout while avoiding repeated DOM primitives.
 */
export const Panel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div {...props} ref={ref} />,
);

Panel.displayName = "Panel";
