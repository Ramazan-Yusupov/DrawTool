import type { BoardElement } from "@/entities/element";
import { deserializeScene } from "@/entities/scene/lib/deserializeScene";
import type { SceneFile } from "@/entities/scene/lib/serializeScene";
import { serializeScene } from "@/entities/scene/lib/serializeScene";
import { STORAGE_KEYS } from "@/shared/config/storageConfig";
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from "@/shared/lib/storage/localStorage";

export function saveSceneToLocalStorage(elements: BoardElement[]) {
  return writeLocalStorage(STORAGE_KEYS.scene, serializeScene(elements));
}

export function loadSceneFromLocalStorage() {
  const saved = readLocalStorage<SceneFile>(STORAGE_KEYS.scene);
  if (!saved) return null;

  try {
    return deserializeScene(JSON.stringify(saved));
  } catch {
    removeLocalStorage(STORAGE_KEYS.scene);
    return null;
  }
}

export function clearLocalScene() {
  return removeLocalStorage(STORAGE_KEYS.scene);
}
