import type { BoardElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import {
  attachAllFrameChildren,
  sceneStore,
} from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { createId } from "@/shared/lib";
import { readLocalStorage, writeLocalStorage } from "@/shared/lib/storage/localStorage";
import {
  clearLocalScene,
  loadSceneFromLocalStorage,
} from "@/features/save-scene/api/localSceneRepository";
import {
  getProjectById,
  getProjects,
  putProject,
  removeProject,
} from "./projectRepository";
import { MAX_PROJECTS } from "./types";
import type { DrawToolProject, ProjectsState } from "./types";

type ProjectsListener = () => void;

const ACTIVE_PROJECT_STORAGE_KEY = "drawtool:active-project:v1";

let state: ProjectsState = {
  activeProjectId: null,
  isReady: false,
  isSidebarOpen: false,
  projects: [],
};

const listeners = new Set<ProjectsListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<ProjectsState>) {
  state = {
    ...state,
    ...patch,
  };
  notify();
}

function cloneElements(elements: BoardElement[]) {
  return JSON.parse(JSON.stringify(elements)) as BoardElement[];
}

function createProjectRecord(name: string, elements: BoardElement[] = []): DrawToolProject {
  const now = Date.now();

  return {
    id: createId("project"),
    name: name.trim() || "Новый проект",
    createdAt: now,
    updatedAt: now,
    elements: cloneElements(elements),
  };
}

async function refreshProjects() {
  const projects = await getProjects();
  setState({ projects });
  return projects;
}

function setActiveProjectId(id: string | null) {
  writeLocalStorage(ACTIVE_PROJECT_STORAGE_KEY, id);
  setState({ activeProjectId: id });
}

function applyProjectToScene(project: DrawToolProject) {
  const elements = attachAllFrameChildren(project.elements);
  sceneStore.setElements(elements);
  selectionStore.clear();
  historyStore.clear();
}

export const projectStore = {
  get() {
    return state;
  },

  subscribe(listener: ProjectsListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  openSidebar() {
    setState({ isSidebarOpen: true });
  },

  closeSidebar() {
    setState({ isSidebarOpen: false });
  },

  toggleSidebar() {
    setState({ isSidebarOpen: !state.isSidebarOpen });
  },

  async initialize() {
    if (state.isReady) {
      return;
    }

    try {
      let projects = await getProjects();

      if (projects.length === 0) {
        const legacyElements = loadSceneFromLocalStorage() ?? [];
        const firstProject = createProjectRecord("Мой первый проект", legacyElements);
        await putProject(firstProject);
        clearLocalScene();
        projects = await getProjects();
      }

      const rememberedProjectId = readLocalStorage<string | null>(
        ACTIVE_PROJECT_STORAGE_KEY,
      );
      const activeProjectId = projects.some(
        (project) => project.id === rememberedProjectId,
      )
        ? rememberedProjectId
        : projects[0]?.id ?? null;

      const activeProject = activeProjectId
        ? await getProjectById(activeProjectId)
        : null;

      if (activeProject) {
        applyProjectToScene(activeProject);
      }

      state = {
        ...state,
        activeProjectId,
        isReady: true,
        projects,
      };
      writeLocalStorage(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
      notify();
    } catch {
      setState({ isReady: true });
    }
  },

  async saveActiveProject(elements = sceneStore.get().elements) {
    const projectId = state.activeProjectId;
    if (!state.isReady || !projectId) {
      return false;
    }

    try {
      const current = await getProjectById(projectId);
      if (!current) {
        return false;
      }

      await putProject({
        ...current,
        elements: cloneElements(elements),
        updatedAt: Date.now(),
      });
      await refreshProjects();
      return true;
    } catch {
      return false;
    }
  },

  async createProject(name = "Новый проект") {
    if (state.projects.length >= MAX_PROJECTS) {
      return { ok: false as const, reason: "limit" as const };
    }

    await this.saveActiveProject();

    try {
      const project = createProjectRecord(name);
      await putProject(project);
      const projects = await refreshProjects();
      setActiveProjectId(project.id);
      applyProjectToScene(project);
      setState({ projects, isSidebarOpen: false });
      return { ok: true as const, project };
    } catch {
      return { ok: false as const, reason: "storage" as const };
    }
  },

  async openProject(id: string) {
    if (id === state.activeProjectId) {
      this.closeSidebar();
      return true;
    }

    await this.saveActiveProject();

    try {
      const project = await getProjectById(id);
      if (!project) {
        return false;
      }

      applyProjectToScene(project);
      setActiveProjectId(project.id);
      setState({ isSidebarOpen: false });
      return true;
    } catch {
      return false;
    }
  },

  async renameProject(id: string, name: string) {
    const nextName = name.trim();
    if (!nextName) {
      return false;
    }

    try {
      const project = await getProjectById(id);
      if (!project) {
        return false;
      }

      await putProject({
        ...project,
        name: nextName,
        updatedAt: Date.now(),
      });
      await refreshProjects();
      return true;
    } catch {
      return false;
    }
  },

  async deleteProject(id: string) {
    try {
      await removeProject(id);
      const projects = await refreshProjects();

      if (id !== state.activeProjectId) {
        return true;
      }

      const nextProjectId = projects[0]?.id ?? null;

      if (nextProjectId) {
        await this.openProject(nextProjectId);
      } else {
        const result = await this.createProject("Новый проект");
        if (!result.ok) {
          sceneStore.clear();
          selectionStore.clear();
          historyStore.clear();
          setActiveProjectId(null);
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  async createImportedProject(name: string, elements: BoardElement[]) {
    if (state.projects.length >= MAX_PROJECTS) {
      return { ok: false as const, reason: "limit" as const };
    }

    await this.saveActiveProject();

    try {
      const project = createProjectRecord(name, attachAllFrameChildren(elements));
      await putProject(project);
      const projects = await refreshProjects();
      setActiveProjectId(project.id);
      applyProjectToScene(project);
      setState({ projects, isSidebarOpen: false });
      return { ok: true as const, project };
    } catch {
      return { ok: false as const, reason: "storage" as const };
    }
  },
};
