import { historyStore } from "@/entities/history";

export function undo() {
  return historyStore.undo();
}
