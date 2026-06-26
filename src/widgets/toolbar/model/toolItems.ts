import type { ToolId } from "@/entities/tool";

export type ToolbarItem = {
  icon: string;
  id: ToolId;
  label: string;
  shortcut: string;
};

export const TOOL_ITEMS: readonly ToolbarItem[] = [
  {
    id: "selection",
    label: "Выбор",
    shortcut: "V",
    icon: "↖",
  },
  {
    id: "rectangle",
    label: "Прямоугольник",
    shortcut: "R",
    icon: "□",
  },
];
