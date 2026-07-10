import { deserializeScene, serializeScene } from "@/entities/scene";
import type { BoardElement } from "@/entities/element";
import type { SnapshotItem } from "./storage";

const DRAWTOOL_FILE_FORMAT = "drawtool-file";

export function createDrawToolFile(elements: BoardElement[], snapshots: SnapshotItem[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const payload = {
    format: DRAWTOOL_FILE_FORMAT,
    version: 1,
    savedAt: new Date().toISOString(),
    scene: serializeScene(elements),
    snapshots,
  };

  return {
    blob: new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    }),
    fileName: `drawtool-project-${timestamp}.drawtool`,
  };
}

export function parseDrawToolFile(source: string) {
  const parsed = JSON.parse(source) as {
    format?: string;
    scene?: ReturnType<typeof serializeScene>;
    snapshots?: SnapshotItem[];
  };
  const elements =
    parsed.format === DRAWTOOL_FILE_FORMAT && parsed.scene
      ? deserializeScene(JSON.stringify(parsed.scene))
      : deserializeScene(source);

  return {
    elements,
    snapshots: Array.isArray(parsed.snapshots)
      ? parsed.snapshots.slice(0, 12)
      : undefined,
  };
}
