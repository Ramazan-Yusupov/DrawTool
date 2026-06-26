import type { BoardElement } from "@/entities/element";

export const MAX_PROJECTS = 20;

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
