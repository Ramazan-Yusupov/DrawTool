import type { BoardElement } from "@/entities/element";
import {
  deleteIndexedRecord,
  getAllIndexedRecords,
  getIndexedRecord,
  putIndexedRecord,
} from "@/shared/lib/storage/indexedDb";
import type { DrawToolProject, ProjectSummary } from "./types";

function cloneElements(elements: BoardElement[]) {
  return JSON.parse(JSON.stringify(elements)) as BoardElement[];
}

function cloneProject(project: DrawToolProject): DrawToolProject {
  return {
    ...project,
    elements: cloneElements(project.elements),
  };
}

export async function getProjects() {
  const projects = await getAllIndexedRecords<DrawToolProject>();

  return projects
    .map((project): ProjectSummary => ({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

export async function getProjectById(id: string) {
  const project = await getIndexedRecord<DrawToolProject>(id);
  return project ? cloneProject(project) : null;
}

export async function putProject(project: DrawToolProject) {
  await putIndexedRecord(cloneProject(project));
}

export async function removeProject(id: string) {
  await deleteIndexedRecord(id);
}
