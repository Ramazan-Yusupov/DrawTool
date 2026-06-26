import { historyStore } from "@/entities/history";

export function redo() {
  return historyStore.redo();
}
