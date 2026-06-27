import { serializeScene } from "@/entities/scene";
import type { BoardElement } from "@/entities/element";
import type { ExportFile, ExportOptions } from "./types";

/** Serializes a scene into a DrawTool-compatible JSON download. */
export function exportToJson(elements: BoardElement[], options: ExportOptions = {}): ExportFile {
  return {
    blob: new Blob([JSON.stringify(serializeScene(elements), null, 2)], { type: "application/json" }),
    fileName: options.fileName ?? "drawtool-scene.json",
    mimeType: "application/json",
  };
}
