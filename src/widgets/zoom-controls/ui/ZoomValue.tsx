type ZoomValueProps = { zoom: number };

/** Displays a human-readable viewport zoom percentage. */
export function ZoomValue({ zoom }: ZoomValueProps) {
  return <output className="min-w-12 text-center text-xs tabular-nums text-text">{Math.round(zoom * 100)}%</output>;
}
