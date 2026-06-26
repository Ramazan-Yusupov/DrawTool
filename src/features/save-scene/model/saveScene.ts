import { sceneStore } from "@/entities/scene";
import { projectStore } from "@/features/projects";

/** Saves the active project to IndexedDB. */
export function saveScene() {
  return projectStore.saveActiveProject(sceneStore.get().elements);
}
