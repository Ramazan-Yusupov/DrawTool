import {
  Download,
  FolderOpen,
  FolderTree,
  Keyboard,
  Layers3,
  MoreHorizontal,
  Save,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { ExportMenu } from "@/features/export-scene";
import { resetScene } from "@/entities/scene";
import { ImportButton } from "@/features/import-scene";
import { projectStore } from "@/features/projects";
import { shortcutsHelpStore } from "@/features/shortcuts-help";
import {
  Button,
  Divider,
  IconButton,
  Panel,
  Popover,
  usePopover,
} from "@/shared/ui";
import {
  downloadSceneFile,
  restoreSceneFromFile,
} from "../model/saveSceneFile";
import { saveScene } from "../model/saveScene";

type SceneStorageControlsProps = {
  isLayersOpen?: boolean;
  onOpenToolSettings?: () => void;
  onToggleLayers?: () => void;
};

export function SceneStorageControls({
  isLayersOpen = false,
  onOpenToolSettings,
  onToggleLayers,
}: SceneStorageControlsProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileMenu = usePopover();

  function notify(next: string) {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 1800);
  }

  async function importFile(file: File | undefined) {
    if (!file) {
      return;
    }

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
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  const menuButtonClass =
    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-text transition-colors hover:bg-control";

  return (
    <Panel className="absolute left-34 top-20 z-20 flex items-center gap-1 rounded-xl border border-border bg-panel p-1.5 shadow-panel max-sm:left-2 sm:top-4 max-lg:left-33 max-lg:gap-0.5">
      <IconButton
        aria-label="Открыть проекты"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => projectStore.toggleSidebar()}
        title="Проекты"
        type="button"
      >
        <FolderTree aria-hidden size={17} />
      </IconButton>

      <IconButton
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
      </IconButton>

      <IconButton
        aria-label="Скачать файл сцены"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={downloadSceneFile}
        title="Скачать JSON-файл"
        type="button"
      >
        <Download aria-hidden size={17} />
      </IconButton>

      <IconButton
        aria-label="Импортировать JSON-проект"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => inputRef.current?.click()}
        title="Импортировать JSON-файл как новый проект"
        type="button"
      >
        <FolderOpen aria-hidden size={17} />
      </IconButton>

      <IconButton
        aria-label="Открыть горячие клавиши"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={() => shortcutsHelpStore.open()}
        title="Горячие клавиши"
        type="button"
      >
        <Keyboard aria-hidden size={17} />
      </IconButton>

      <IconButton
        aria-expanded={fileMenu.isOpen}
        aria-haspopup="menu"
        aria-label="Дополнительные действия с доской"
        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-control"
        onClick={fileMenu.toggle}
        title="Дополнительно"
        type="button"
      >
        <MoreHorizontal aria-hidden size={18} />
      </IconButton>

      <input
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void importFile(event.currentTarget.files?.[0])}
        ref={inputRef}
        type="file"
      />

      <Popover
        aria-label="Дополнительные действия с доской"
        className="absolute left-0 top-[calc(100%+0.5rem)] w-60"
        isOpen={fileMenu.isOpen}
        role="menu"
      >
        <Button
          className={menuButtonClass}
          onClick={() => {
            onToggleLayers?.();
            fileMenu.close();
          }}
          type="button"
        >
          <Layers3
            aria-hidden
            className={isLayersOpen ? "text-accent" : undefined}
            size={17}
          />
          <span>Слои</span>
        </Button>

        <Button
          className={menuButtonClass}
          onClick={() => {
            onOpenToolSettings?.();
            fileMenu.close();
          }}
          type="button"
        >
          <Settings2 aria-hidden size={17} />
          <span>Настройки инструмента</span>
        </Button>

        <Button
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-500/10"
          onClick={() => {
            resetScene();
            fileMenu.close();
            notify("Доска очищена");
          }}
          type="button"
        >
          <Trash2 aria-hidden size={17} />
          <span>Очистить доску</span>
        </Button>

        <Divider className="my-2" />

        <p className="m-0 px-2 pb-1 text-xs font-medium text-text-muted">
          Экспортировать
        </p>

        <div className="space-y-1">
          {(["json", "png", "svg"] as const).map((format) => (
            <ExportMenu
              className={menuButtonClass}
              format={format}
              key={format}
              onExported={fileMenu.close}
            >
              <Download aria-hidden size={17} />
              <span>Скачать {format.toUpperCase()}</span>
            </ExportMenu>
          ))}
        </div>

        <Divider className="my-2" />

        <ImportButton
          className={menuButtonClass}
          onImported={fileMenu.close}
          title="Заменить текущую доску JSON-файлом"
        >
          <Upload aria-hidden size={17} />
          <span>Импортировать в доску</span>
        </ImportButton>
      </Popover>

      {message && (
        <span className="absolute left-0 top-12 whitespace-nowrap rounded-md border border-border bg-panel px-2 py-1 text-xs text-text shadow-panel">
          {message}
        </span>
      )}
    </Panel>
  );
}
