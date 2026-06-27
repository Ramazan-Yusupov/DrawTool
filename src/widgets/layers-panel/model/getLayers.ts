import type { BoardElement } from "@/entities/element";

export type BoardLayer = {
  element: BoardElement;
  index: number;
  label: string;
};

const LAYER_LABELS: Record<BoardElement["type"], string> = {
  arrow: "Стрелка", cloud: "Облако", code: "Код", image: "Изображение", diamond: "Ромб", ellipse: "Эллипс", embed: "Встроенная страница", frame: "Фрейм", freedraw: "Карандаш", highlighter: "Маркер", sticky: "Стикер", callout: "Комментарий", measure: "Измерение", table: "Таблица", sticker: "Иконка / стикер", hexagon: "Шестиугольник", line: "Линия", rectangle: "Прямоугольник", star: "Звезда", text: "Текст", triangle: "Треугольник",
};

/** Returns topmost-first layer rows for the active layer navigation panel. */
export function getLayers(elements: BoardElement[]): BoardLayer[] {
  return elements.map((element, index) => ({
    element,
    index,
    label: element.type === "text" && element.text.trim() ? element.text.trim().slice(0, 32) : LAYER_LABELS[element.type],
  })).reverse();
}
