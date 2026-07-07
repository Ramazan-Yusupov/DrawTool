import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Braces,
  Crosshair,
  Ellipsis,
  Globe2,
  LassoSelect,
  Network,
  Sparkles,
  Highlighter,
  MessageSquareText,
  Paintbrush,
  Pipette,
  Ruler,
  SmilePlus,
  StickyNote,
  Table2,
  Code2,
  Workflow,
} from "lucide-react";
import { toolStore } from "@/entities/tool";
import { generateStore } from "@/features/generate";
import { ImageUploadMenuItem } from "@/features/add-image";
import { stickerSettingsStore } from "@/features/add-sticker";
import {
  applyCopiedStyleToSelectedElements,
  styleClipboardStore,
} from "@/features/style-clipboard";
import { IconButton, Popover } from "@/shared/ui";
import { useMoreToolsMenuPosition } from "../model/useMoreToolsMenuPosition";
import { MORE_SHAPE_ITEMS } from "../model/toolItems";
import { MoreToolsMenuItem } from "./MoreToolsMenuItem";

const BOARD_TOOLS = [
  { id: "sticky", label: "Стикер-заметка", shortcut: "N", icon: StickyNote },
  {
    id: "callout",
    label: "Комментарий / Callout",
    shortcut: "M",
    icon: MessageSquareText,
  },
  { id: "table", label: "Таблица", shortcut: "", icon: Table2 },
  { id: "measure", label: "Линейка / измерение", shortcut: "", icon: Ruler },
  { id: "highlighter", label: "Маркер", shortcut: "", icon: Highlighter },
] as const;

export function MoreToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const styleClipboard = useSyncExternalStore(
    styleClipboardStore.subscribe,
    styleClipboardStore.get,
    styleClipboardStore.get,
  );

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuPosition = useMoreToolsMenuPosition(isOpen, buttonRef);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const clickedButton = buttonRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="shrink-0">
      <IconButton
        ref={buttonRef}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Больше инструментов"
        className="grid size-10 place-items-center rounded-lg text-text hover:bg-control max-lg:size-11"
        onClick={() => setIsOpen((open) => !open)}
        title="Больше инструментов"
        type="button"
      >
        <Ellipsis size={20} />
      </IconButton>

      {isOpen &&
        menuPosition &&
        createPortal(
          <div ref={menuRef}>
            <Popover
              aria-label="Дополнительные инструменты"
              className="fixed z-60 overflow-y-auto overscroll-contain"
              isOpen={isOpen}
              role="menu"
              style={menuPosition}
            >
              <div className="space-y-1">
                {MORE_SHAPE_ITEMS.slice(0, 2).map((item) => {
                  const Icon = item.icon;

                  return (
                    <MoreToolsMenuItem
                      icon={item.id === "embed" ? Globe2 : Icon}
                      key={item.id}
                      label={item.label}
                      onClick={() => {
                        toolStore.set(item.id);
                        setIsOpen(false);
                      }}
                      shortcut={item.shortcut}
                      shortcutHint={item.shortcutHint}
                    />
                  );
                })}

                <ImageUploadMenuItem onImageAdded={() => setIsOpen(false)} />

                {BOARD_TOOLS.map((item) => {
                  return (
                    <MoreToolsMenuItem
                      icon={item.icon}
                      key={item.id}
                      label={item.label}
                      onClick={() => {
                        toolStore.set(item.id);
                        setIsOpen(false);
                      }}
                      shortcut={item.shortcut}
                    />
                  );
                })}

                <MoreToolsMenuItem
                  icon={Code2}
                  label="Блок кода"
                  onClick={() => {
                    toolStore.set("code");
                    setIsOpen(false);
                  }}
                  shortcut="J"
                  shortcutHint="J"
                />

                <MoreToolsMenuItem
                  icon={SmilePlus}
                  label="Иконки и стикеры"
                  onClick={() => {
                    stickerSettingsStore.openPicker();
                    setIsOpen(false);
                  }}
                />

                <MoreToolsMenuItem
                  icon={Pipette}
                  label="Пипетка стиля"
                  onClick={() => {
                    toolStore.set("eyedropper");
                    setIsOpen(false);
                  }}
                />

                <MoreToolsMenuItem
                  disabled={!styleClipboard.style}
                  icon={Paintbrush}
                  label="Применить стиль"
                  onClick={() => {
                    applyCopiedStyleToSelectedElements();
                    setIsOpen(false);
                  }}
                />

                <MoreToolsMenuItem
                  icon={Crosshair}
                  label="Лазерная указка"
                  onClick={() => {
                    toolStore.set("laser");
                    setIsOpen(false);
                  }}
                  shortcut="K"
                />

                <MoreToolsMenuItem
                  icon={LassoSelect}
                  label="Выделение лассо"
                  onClick={() => {
                    toolStore.set("lasso");
                    setIsOpen(false);
                  }}
                  shortcut="L"
                />
              </div>

              <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">
                Generate
              </p>

              <div className="space-y-1">
                <MoreToolsMenuItem
                  icon={Sparkles}
                  label="Текст в диаграмму"
                  onClick={() => {
                    generateStore.open("diagram");
                    setIsOpen(false);
                  }}
                  trailing={<Bot className="shrink-0 text-accent" size={15} />}
                />

                <MoreToolsMenuItem
                  icon={Workflow}
                  label="Шаблоны диаграмм"
                  onClick={() => {
                    generateStore.open("templates");
                    setIsOpen(false);
                  }}
                />

                <MoreToolsMenuItem
                  icon={Network}
                  label="Mermaid в DrawTool"
                  onClick={() => {
                    generateStore.open("mermaid");
                    setIsOpen(false);
                  }}
                />

                <MoreToolsMenuItem
                  icon={Braces}
                  label="Каркас для кода"
                  onClick={() => {
                    generateStore.open("code");
                    setIsOpen(false);
                  }}
                  trailing={<Bot className="shrink-0 text-accent" size={15} />}
                />
              </div>

              <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">
                Другие фигуры
              </p>

              <div className="grid grid-cols-2 gap-1">
                {MORE_SHAPE_ITEMS.slice(2).map((item) => {
                  return (
                    <MoreToolsMenuItem
                      icon={item.icon}
                      key={item.id}
                      label={item.label}
                      onClick={() => {
                        toolStore.set(item.id);
                        setIsOpen(false);
                      }}
                      shortcutHint={item.shortcutHint}
                      title={`${item.label} (${item.shortcutHint})`}
                      variant="compact"
                    />
                  );
                })}
              </div>
            </Popover>
          </div>,
          document.body,
        )}
    </div>
  );
}
