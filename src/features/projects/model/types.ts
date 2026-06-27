import type { BoardElement } from "@/entities/element";
import { APP_CONFIG } from "@/shared/config";

export const MAX_PROJECTS = APP_CONFIG.projectLimit;

export type DrawToolProject = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  elements: BoardElement[];
};

export type ProjectSummary = Omit<DrawToolProject, "elements">;

export type ProjectsState = {
  activeProjectId: string | null;
  isReady: boolean;
  isSidebarOpen: boolean;
  projects: ProjectSummary[];
};
