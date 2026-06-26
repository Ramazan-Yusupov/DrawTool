import {
  ArrowRight,
  Circle,
  Cloud,
  Diamond,
  Eraser,
  Frame,
  Hand,
  Hexagon,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Star,
  Triangle,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ToolId } from "@/entities/tool";

export type ToolbarItem = {
  icon: LucideIcon;
  id: ToolId;
  label: string;
  shortcut: string;
  group?: "core" | "actions";
};

export const TOOL_ITEMS: readonly ToolbarItem[] = [
  {
    id: "pan",
    label: "Перемещение холста",
    shortcut: "M",
    icon: Hand,
    group: "core",
  },
  {
    id: "selection",
    label: "Выбор",
    shortcut: "V",
    icon: MousePointer2,
    group: "core",
  },
  {
    id: "rectangle",
    label: "Прямоугольник",
    shortcut: "R",
    icon: Square,
    group: "core",
  },
  {
    id: "diamond",
    label: "Ромб",
    shortcut: "D",
    icon: Diamond,
    group: "core",
  },
  {
    id: "ellipse",
    label: "Эллипс",
    shortcut: "E",
    icon: Circle,
    group: "core",
  },
  {
    id: "arrow",
    label: "Стрелка",
    shortcut: "A",
    icon: ArrowRight,
    group: "core",
  },
  {
    id: "line",
    label: "Линия",
    shortcut: "L",
    icon: Minus,
    group: "core",
  },
  {
    id: "freedraw",
    label: "Карандаш",
    shortcut: "P",
    icon: Pencil,
    group: "core",
  },
  {
    id: "text",
    label: "Текст",
    shortcut: "T",
    icon: Type,
    group: "core",
  },
  {
    id: "eraser",
    label: "Ластик",
    shortcut: "X",
    icon: Eraser,
    group: "actions",
  },
];

export const MORE_SHAPE_ITEMS: readonly ToolbarItem[] = [
  {
    id: "frame",
    label: "Фреймовый инструмент",
    shortcut: "F",
    icon: Frame,
  },
  {
    id: "embed",
    label: "Встроенная страница",
    shortcut: "B",
    icon: Square,
  },
  {
    id: "triangle",
    label: "Треугольник",
    shortcut: "G",
    icon: Triangle,
  },
  {
    id: "hexagon",
    label: "Шестиугольник",
    shortcut: "H",
    icon: Hexagon,
  },
  {
    id: "star",
    label: "Звезда",
    shortcut: "S",
    icon: Star,
  },
  {
    id: "cloud",
    label: "Облако",
    shortcut: "C",
    icon: Cloud,
  },
];
