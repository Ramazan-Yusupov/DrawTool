import type { BoardElement } from "@/entities/element";
import type { SceneLayer } from "@/entities/scene";
import type { Viewport } from "@/entities/viewport";
import { APP_CONFIG } from "@/shared/config";

export const MAX_PROJECTS = APP_CONFIG.projectLimit;

export type DrawToolProject = {
  activeLayerId?: string;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  elements: BoardElement[];
  layers?: SceneLayer[];
  viewport: Viewport;
};

export type ProjectSummary = Omit<DrawToolProject, "elements" | "viewport">;

export type ProjectsState = {
  activeProjectId: string | null;
  isReady: boolean;
  isSidebarOpen: boolean;
  projects: ProjectSummary[];
};
