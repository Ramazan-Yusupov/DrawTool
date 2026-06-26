import { Download, FolderOpen, FolderTree, Keyboard, Save } from "lucide-react";
import { useRef, useState } from "react";
import { projectStore } from "@/features/projects";
import { shortcutsHelpStore } from "@/features/shortcuts-help";
import {
  downloadSceneFile,
  restoreSceneFromFile,
} from "../model/saveSceneFile";
import { saveScene } from "../model/saveScene";

export function SceneStorageControls() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function notify(next: string) {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 1800);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;

    try {
      await restoreSceneFromFile(file);
      notify("Проект импортирован");
    } catch (error) {
      notify(
        error instanceof Error && error.message === "Project limit reached"
          ? "Достигнут лимит: 20 проектов"
          : "Не удалось прочитать файл",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="absolute left-34 max-sm:left-2 sm:top-4 top-20 z-20 flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-lg:left-33  max-lg:gap-0.5">
      <button
        aria-label="Открыть проекты"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => projectStore.toggleSidebar()}
        title="Проекты"
        type="button"
      >
        <FolderTree aria-hidden size={17} />
      </button>

      <button
        aria-label="Сохранить активный проект"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => {
          void saveScene().then((saved) => {
            notify(saved ? "Сохранено" : "Не удалось сохранить");
          });
        }}
        title="Сохранить проект"
        type="button"
      >
        <Save aria-hidden size={17} />
      </button>

      <button
        aria-label="Скачать файл сцены"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={downloadSceneFile}
        title="Скачать JSON-файл"
        type="button"
      >
        <Download aria-hidden size={17} />
      </button>

      <button
        aria-label="Импортировать JSON-проект"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => inputRef.current?.click()}
        title="Импортировать JSON-файл как новый проект"
        type="button"
      >
        <FolderOpen aria-hidden size={17} />
      </button>

      <button
        aria-label="Открыть горячие клавиши"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => shortcutsHelpStore.open()}
        title="Горячие клавиши"
        type="button"
      >
        <Keyboard aria-hidden size={17} />
      </button>

      <input
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void importFile(event.currentTarget.files?.[0])}
        ref={inputRef}
        type="file"
      />

      {message && (
        <span className="absolute left-0 top-12 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-1 text-xs text-text shadow-panel">
          {message}
        </span>
      )}
    </div>
  );
}
