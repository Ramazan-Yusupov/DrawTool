import { updateElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";

function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function setElementLink(elementId: string, value: string) {
  const link = normalizeLink(value);
  const current = sceneStore.get().elements.find((element) => element.id === elementId);
  if (!current || current.link === link) return false;
  historyStore.begin();
  sceneStore.updateById(elementId, (element) => updateElement(element, { link }));
  return historyStore.commit();
}
