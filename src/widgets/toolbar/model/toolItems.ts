import {
  ArrowRight,
  Circle,
  Diamond,
  Minus,
  MousePointer2,
  Square,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolId } from "@/entities/tool";

export type ToolbarItem = {
  icon: LucideIcon;
  id: ToolId;
  label: string;
  shortcut: string;
};

export const TOOL_ITEMS: readonly ToolbarItem[] = [
  { id: "selection", label: "Выбор", shortcut: "V", icon: MousePointer2 },
  { id: "rectangle", label: "Прямоугольник", shortcut: "R", icon: Square },
  { id: "diamond", label: "Ромб", shortcut: "D", icon: Diamond },
  { id: "ellipse", label: "Эллипс", shortcut: "E", icon: Circle },
  { id: "arrow", label: "Стрелка", shortcut: "A", icon: ArrowRight },
  { id: "line", label: "Линия", shortcut: "L", icon: Minus },
  { id: "text", label: "Текст", shortcut: "T", icon: Type },
];
