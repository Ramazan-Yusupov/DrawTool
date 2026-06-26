import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Braces,
  Crosshair,
  Ellipsis,
  Globe2,
  LassoSelect,
  Network,
  Sparkles,
} from "lucide-react";
import { toolStore } from "@/entities/tool";
import { generateStore } from "@/features/generate";
import { MORE_SHAPE_ITEMS } from "../model/toolItems";

export function MoreToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-label="Больше инструментов"
        className="grid size-10 place-items-center rounded-lg text-text hover:bg-control max-lg:size-11"
        onClick={() => setIsOpen((open) => !open)}
        title="Больше инструментов"
        type="button"
      >
        <Ellipsis size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-72 max-w-[calc(100dvw-1rem)] rounded-xl border border-border bg-panel p-2 shadow-panel max-lg:fixed max-lg:inset-x-2 max-lg:bottom-[5.25rem] max-lg:top-auto max-lg:w-auto">
          <div className="space-y-1">
            {MORE_SHAPE_ITEMS.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control"
                  key={item.id}
                  onClick={() => {
                    toolStore.set(item.id);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  {item.id === "embed" ? <Globe2 size={17} /> : <Icon size={17} />}
                  <span className="flex-1">{item.label}</span>
                  <kbd className="text-xs text-text-muted">{item.shortcut}</kbd>
                </button>
              );
            })}
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control" onClick={() => { toolStore.set("laser"); setIsOpen(false); }} type="button">
              <Crosshair size={17} /><span className="flex-1">Лазерная указка</span><kbd className="text-xs text-text-muted">K</kbd>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control" onClick={() => { toolStore.set("lasso"); setIsOpen(false); }} type="button">
              <LassoSelect size={17} /><span className="flex-1">Выделение лассо</span><kbd className="text-xs text-text-muted">Q</kbd>
            </button>
          </div>

          <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">Generate</p>
          <div className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control" onClick={() => { generateStore.open("diagram"); setIsOpen(false); }} type="button">
              <Sparkles size={17} /><span className="flex-1">Текст в диаграмму</span><Bot size={15} className="text-accent" />
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control" onClick={() => { generateStore.open("mermaid"); setIsOpen(false); }} type="button">
              <Network size={17} /><span className="flex-1">Mermaid в DrawTool</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-control" onClick={() => { generateStore.open("code"); setIsOpen(false); }} type="button">
              <Braces size={17} /><span className="flex-1">Каркас для кода</span><Bot size={15} className="text-accent" />
            </button>
          </div>

          <p className="mb-1 mt-3 px-3 text-xs font-semibold text-text-muted">Другие фигуры</p>
          <div className="grid grid-cols-2 gap-1">
            {MORE_SHAPE_ITEMS.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-text hover:bg-control"
                  key={item.id}
                  onClick={() => { toolStore.set(item.id); setIsOpen(false); }}
                  title={`${item.label} (${item.shortcut})`}
                  type="button"
                >
                  <Icon size={16} /><span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
