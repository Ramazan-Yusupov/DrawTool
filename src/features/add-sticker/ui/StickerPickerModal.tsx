import { useSyncExternalStore } from "react";
import { SmilePlus } from "lucide-react";
import { toolStore } from "@/entities/tool";
import { Button, Modal } from "@/shared/ui";
import { stickerSettingsStore } from "../model/stickerSettingsStore";

const STICKERS = ["✨", "⭐", "🔥", "💡", "✅", "❗", "❤️", "🎯", "🚀", "📌", "🧠", "💬", "⚡", "🔒", "⚙️", "📎", "↗️", "✓", "✦", "⚑"];

export function StickerPickerModal() {
  const settings = useSyncExternalStore(stickerSettingsStore.subscribe, stickerSettingsStore.get, stickerSettingsStore.get);
  function choose(content: string) {
    stickerSettingsStore.setContent(content);
    toolStore.set("sticker");
  }
  return (
    <Modal isOpen={settings.isPickerOpen} title="Иконки и стикеры" onClose={() => stickerSettingsStore.closePicker()}>
      <div className="space-y-4">
        <p className="m-0 text-sm text-text-muted">Выберите символ, затем кликните по холсту. Стикер остаётся полностью переносимым в JSON и SVG.</p>
        <div className="grid grid-cols-5 gap-2">
          {STICKERS.map((content) => (
            <Button
              aria-label={`Вставить ${content}`}
              className="grid aspect-square place-items-center rounded-lg border border-border bg-control text-2xl transition-colors hover:bg-surface-muted"
              key={content}
              onClick={() => choose(content)}
              type="button"
            >
              {content}
            </Button>
          ))}
        </div>
        <Button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white" onClick={() => choose(settings.content)} type="button">
          <SmilePlus size={16} /> Использовать текущий: {settings.content}
        </Button>
      </div>
    </Modal>
  );
}
