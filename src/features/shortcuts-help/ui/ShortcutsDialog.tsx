import { useSyncExternalStore } from "react";
import { Keyboard } from "lucide-react";
import { Modal } from "@/shared/ui";
import { shortcutsHelpStore } from "../model/shortcutsHelpStore";

const SHORTCUT_GROUPS = [
  {
    title: "Инструменты",
    rows: [
      ["M", "Перемещение холста"],
      ["V", "Выбор"],
      ["R", "Прямоугольник"],
      ["D", "Ромб"],
      ["E", "Эллипс"],
      ["A", "Стрелка"],
      ["L", "Линия"],
      ["P", "Карандаш"],
      ["T", "Текст"],
      ["F", "Фрейм"],
      ["B", "Встроенная страница"],
      ["G / H / S / C", "Треугольник / шестиугольник / звезда / облако"],
      ["K", "Лазерная указка"],
      ["Q", "Выделение лассо"],
      ["X", "Ластик"],
    ],
  },
  {
    title: "Редактирование",
    rows: [
      ["Delete / Backspace", "Удалить выбранное"],
      ["Ctrl/Cmd + Z", "Отменить"],
      ["Ctrl/Cmd + Shift + Z", "Повторить"],
      ["Ctrl/Cmd + D", "Дублировать"],
      ["Shift + клик", "Добавить объект к выделению"],
      ["Ctrl/Cmd + Shift + L", "Заблокировать / разблокировать редактирование"],
      ["Escape", "Снять выделение и включить курсор"],
    ],
  },
  {
    title: "Холст и трансформации",
    rows: [
      ["Ctrl/Cmd + колесо", "Масштаб"],
      ["Shift при рисовании", "Пропорции / ограничение угла"],
      ["Shift при переносе", "Перемещение по одной оси"],
      ["Ctrl/Cmd при переносе", "Выравнивание по объектам"],
      ["Ctrl/Cmd при resize", "Привязка"],
      ["Alt при resize", "Изменение размера от центра"],
    ],
  },
] as const;

export function ShortcutsDialog() {
  const isOpen = useSyncExternalStore(
    shortcutsHelpStore.subscribe,
    shortcutsHelpStore.get,
    shortcutsHelpStore.get,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => shortcutsHelpStore.close()}
      title="Горячие клавиши"
    >
      <div className="space-y-5">
        <p className="m-0 flex items-center gap-2 text-sm text-text-muted">
          <Keyboard className="text-accent" size={17} />
          Быстрый справочник по управлению доской.
        </p>

        {SHORTCUT_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-2 text-sm font-semibold text-text">
              {group.title}
            </h3>
            <div className="overflow-hidden rounded-lg border border-border">
              {group.rows.map(([shortcut, description]) => (
                <div
                  className="flex items-center justify-between gap-4 border-b border-border px-3 py-2.5 last:border-b-0"
                  key={shortcut}
                >
                  <span className="text-sm text-text-muted">{description}</span>
                  <kbd className="shrink-0 rounded-md border border-border bg-control px-2 py-1 text-xs font-medium text-text">
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
