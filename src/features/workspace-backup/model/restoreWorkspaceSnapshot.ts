import { toolStore } from "@/entities/tool";
import type { DrawToolWorkspace } from "@/entities/workspace";
import { toolSettingsStore } from "@/features/change-style";
import { projectStore } from "@/features/projects";

export async function restoreWorkspaceSnapshot(workspace: DrawToolWorkspace) {
  const restored = await projectStore.replaceWorkspaceProjects(
    workspace.projects,
    workspace.activeProjectId,
  );

  if (!restored) {
    throw new Error("Не удалось заменить проекты в локальном хранилище.");
  }

  toolStore.set(workspace.preferences.activeTool);
  toolSettingsStore.replaceAll(workspace.preferences.toolSettingsByTool);
}
