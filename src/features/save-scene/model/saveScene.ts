import { sceneStore } from "@/entities/scene";
import { saveSceneToLocalStorage } from "../api/localSceneRepository";

export function saveScene() {
  return saveSceneToLocalStorage(sceneStore.get().elements);
}
