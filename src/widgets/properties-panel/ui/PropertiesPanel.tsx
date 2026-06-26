import { useState } from "react";
import { ToolSettingsModal } from "@/features/change-style";

export function PropertiesPanel() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <button
        className="absolute right-4 top-4 z-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text shadow-panel hover:bg-surface-muted"
        onClick={() => setIsSettingsOpen(true)}
        type="button"
      >
        ⚙ Настройки инструмента
      </button>

      <ToolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
