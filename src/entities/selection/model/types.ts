import type { Rect } from "@/shared/types";

export type SelectionState = {
  elementIds: string[];
  selectionBox: Rect | null;
};
