import { deserializeScene } from "@/entities/scene/lib/deserializeScene";
import { serializeScene } from "@/entities/scene/lib/serializeScene";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { saveSceneToLocalStorage } from "../api/localSceneRepository";

function getFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `drawtool-scene-${timestamp}.json`;
}

export function downloadSceneFile() {
  const file = serializeScene(sceneStore.get().elements);
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFileName();
  link.click();
  URL.revokeObjectURL(url);
}

export async function restoreSceneFromFile(file: File) {
  const source = await file.text();
  const elements = deserializeScene(source);
  sceneStore.setElements(elements);
  selectionStore.clear();
  historyStore.clear();
  saveSceneToLocalStorage(elements);
}
