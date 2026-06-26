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
  {
    id: "ellipse",
    label: "Эллипс",
    shortcut: "E",
    icon: "○",
  },
  {
    id: "diamond",
    label: "Ромб",
    shortcut: "D",
    icon: "◇",
  },
  {
    id: "line",
    label: "Линия",
    shortcut: "L",
    icon: "╱",
  },
  {
    id: "arrow",
    label: "Стрелка",
    shortcut: "A",
    icon: "➜",
  },
];
