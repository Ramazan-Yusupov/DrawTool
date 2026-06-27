import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
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
  Workflow,
} from "lucide-react";
import { toolStore } from "@/entities/tool";
import { generateStore } from "@/features/generate";
import { ImageUploadMenuItem } from "@/features/add-image";
import { stickerSettingsStore } from "@/features/add-sticker";
import { applyCopiedStyleToSelectedElements, styleClipboardStore } from "@/features/style-clipboard";
import { Button, IconButton, Popover } from "@/shared/ui";
import { MORE_SHAPE_ITEMS } from "../model/toolItems";

type MenuPosition = {
  bottom?: number;
  left: number;
  maxHeight: number;
  top?: number;
  width: number;
};

const TOOLBAR_BOTTOM_BREAKPOINT = 1100;
const VIEWPORT_GUTTER = 8;
const MENU_GAP = 8;
const DESKTOP_MENU_WIDTH = 288;
const MOBILE_MENU_WIDTH = 320;

const BOARD_TOOLS = [
  { id: "sticky", label: "Стикер-заметка", shortcut: "N", icon: StickyNote },
  { id: "callout", label: "Комментарий / Callout", shortcut: "M", icon: MessageSquareText },
  { id: "table", label: "Таблица", shortcut: "", icon: Table2 },
  { id: "measure", label: "Линейка / измерение", shortcut: "", icon: Ruler },
  { id: "highlighter", label: "Маркер", shortcut: "", icon: Highlighter },
] as const;

export function MoreToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const styleClipboard = useSyncExternalStore(
    styleClipboardStore.subscribe,
    styleClipboardStore.get,
    styleClipboardStore.get,
  );

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function updateMenuPosition() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Должно совпадать с breakpoint toolbar:
    // max-[1100px] — toolbar находится снизу.
    const isBottomToolbar = viewportWidth <= TOOLBAR_BOTTOM_BREAKPOINT;

    const width = Math.min(
      isBottomToolbar ? MOBILE_MENU_WIDTH : DESKTOP_MENU_WIDTH,
      viewportWidth - VIEWPORT_GUTTER * 2,
    );

    const left = Math.max(
      VIEWPORT_GUTTER,
      Math.min(rect.right - width, viewportWidth - width - VIEWPORT_GUTTER),
    );

    if (isBottomToolbar) {
      // Нижний toolbar: меню раскрывается вверх.
      setMenuPosition({
        bottom: Math.max(VIEWPORT_GUTTER, viewportHeight - rect.top + MENU_GAP),
        left,
        maxHeight: Math.max(160, rect.top - VIEWPORT_GUTTER * 2),
        width,
      });

      return;
    }

    // Верхний toolbar: меню раскрывается вниз.
    setMenuPosition({
      left,
      maxHeight: Math.max(
        180,
        viewportHeight - rect.bottom - VIEWPORT_GUTTER * 2,
      ),
      top: rect.bottom + MENU_GAP,
      width,
    });
  }

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

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
              className="fixed z-[60] overflow-y-auto overscroll-contain"
              isOpen={isOpen}
              role="menu"
              style={menuPosition}
            >
              <div className="space-y-1">
                {MORE_SHAPE_ITEMS.slice(0, 2).map((item) => {
                  const Icon = item.icon;

                  return (
                    <Button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                      key={item.id}
                      onClick={() => {
                        toolStore.set(item.id);
                        setIsOpen(false);
                      }}
                      type="button"
                    >
                      {item.id === "embed" ? (
                        <Globe2 size={17} />
                      ) : (
                        <Icon size={17} />
                      )}

                      <span className="flex-1">{item.label}</span>

                      <kbd
                        className="text-xs text-text-muted"
                        title={item.shortcutHint}
                      >
                        {item.shortcut}
                      </kbd>
                    </Button>
                  );
                })}

                <ImageUploadMenuItem onImageAdded={() => setIsOpen(false)} />

                {BOARD_TOOLS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                      key={item.id}
                      onClick={() => { toolStore.set(item.id); setIsOpen(false); }}
                      type="button"
                    >
                      <Icon size={17} />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && <kbd className="text-xs text-text-muted">{item.shortcut}</kbd>}
                    </Button>
                  );
                })}

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => { stickerSettingsStore.openPicker(); setIsOpen(false); }}
                  type="button"
                >
                  <SmilePlus size={17} />
                  <span className="flex-1">Иконки и стикеры</span>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => { toolStore.set("eyedropper"); setIsOpen(false); }}
                  type="button"
                >
                  <Pipette size={17} />
                  <span className="flex-1">Пипетка стиля</span>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!styleClipboard.style}
                  onClick={() => { applyCopiedStyleToSelectedElements(); setIsOpen(false); }}
                  type="button"
                >
                  <Paintbrush size={17} />
                  <span className="flex-1">Применить стиль</span>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    toolStore.set("laser");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <Crosshair size={17} />
                  <span className="flex-1">Лазерная указка</span>
                  <kbd className="text-xs text-text-muted">K</kbd>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    toolStore.set("lasso");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <LassoSelect size={17} />
                  <span className="flex-1">Выделение лассо</span>
                  <kbd className="text-xs text-text-muted">L</kbd>
                </Button>
              </div>

              <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">
                Generate
              </p>

              <div className="space-y-1">
                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    generateStore.open("diagram");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <Sparkles size={17} />
                  <span className="flex-1">Текст в диаграмму</span>
                  <Bot className="text-accent" size={15} />
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    generateStore.open("templates");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <Workflow size={17} />
                  <span className="flex-1">Шаблоны диаграмм</span>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    generateStore.open("mermaid");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <Network size={17} />
                  <span className="flex-1">Mermaid в DrawTool</span>
                </Button>

                <Button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  onClick={() => {
                    generateStore.open("code");
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <Braces size={17} />
                  <span className="flex-1">Каркас для кода</span>
                  <Bot className="text-accent" size={15} />
                </Button>
              </div>

              <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">
                Другие фигуры
              </p>

              <div className="grid grid-cols-2 gap-1">
                {MORE_SHAPE_ITEMS.slice(2).map((item) => {
                  const Icon = item.icon;

                  return (
                    <Button
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-text hover:bg-control"
                      key={item.id}
                      onClick={() => {
                        toolStore.set(item.id);
                        setIsOpen(false);
                      }}
                      title={`${item.label} (${item.shortcutHint})`}
                      type="button"
                    >
                      <Icon size={16} />
                      <span className="truncate">{item.label}</span>
                    </Button>
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
