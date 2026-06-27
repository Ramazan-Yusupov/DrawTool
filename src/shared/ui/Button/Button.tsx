import { forwardRef } from "react";
import type { ButtonProps } from "./types";

/**
 * Neutral button primitive. It preserves the caller's existing Tailwind classes
 * and only centralizes native button defaults and ref forwarding.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", ...props }, ref) => <button {...props} ref={ref} type={type} />,
);

Button.displayName = "Button";
