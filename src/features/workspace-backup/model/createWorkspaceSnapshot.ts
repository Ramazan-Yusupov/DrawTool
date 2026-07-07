import { toolStore } from "@/entities/tool";
import {
  DRAWTOOL_WORKSPACE_FORMAT,
  DRAWTOOL_WORKSPACE_VERSION,
} from "@/entities/workspace";
import type { DrawToolWorkspace } from "@/entities/workspace";
import { stickerSettingsStore } from "@/features/add-sticker";
import { toolSettingsStore } from "@/features/change-style";
import { projectStore } from "@/features/projects";
import { createId } from "@/shared/lib";

export async function createWorkspaceSnapshot(
  meta: Pick<DrawToolWorkspace, "workspaceId" | "revision"> = {
    workspaceId: createId("workspace"),
    revision: 0,
  },
): Promise<DrawToolWorkspace> {
  const projectState = projectStore.get();
  const projects = await projectStore.getWorkspaceProjects();

  return {
    format: DRAWTOOL_WORKSPACE_FORMAT,
    version: DRAWTOOL_WORKSPACE_VERSION,
    workspaceId: meta.workspaceId || createId("workspace"),
    revision: meta.revision,
    savedAt: new Date().toISOString(),
    activeProjectId: projectState.activeProjectId,
    projects,
    preferences: {
      activeTool: toolStore.get(),
      toolSettingsByTool: toolSettingsStore.getAll(),
      stickerContent: stickerSettingsStore.get().content,
    },
  };
}
