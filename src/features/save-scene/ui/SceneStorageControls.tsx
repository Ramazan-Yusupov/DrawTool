import { Download, FolderOpen, Save } from "lucide-react";
import { useRef, useState } from "react";
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
      notify("Сцена загружена");
    } catch {
      notify("Не удалось прочитать файл");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="absolute left-34 top-4 z-20 flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-lg:left-33 max-lg:top-[max(0.5rem,env(safe-area-inset-top))] max-lg:gap-0.5">
      <button
        aria-label="Сохранить на этом устройстве"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() =>
          notify(saveScene() ? "Сохранено" : "Не удалось сохранить")
        }
        title="Сохранить в localStorage"
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
        aria-label="Открыть файл сцены"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => inputRef.current?.click()}
        title="Открыть JSON-файл"
        type="button"
      >
        <FolderOpen aria-hidden size={17} />
      </button>
      <input
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => importFile(event.currentTarget.files?.[0])}
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
