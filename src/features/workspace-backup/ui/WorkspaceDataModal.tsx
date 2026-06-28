import {
  Download,
  FilePlus2,
  FileUp,
  FolderOpen,
  ImageDown,
  LoaderCircle,
  Replace,
  Unplug,
} from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { sceneStore } from "@/entities/scene";
import { exportToPng, exportToSvg, downloadFile } from "@/features/export-scene";
import { importScene, parseSceneFile } from "@/features/import-scene";
import { projectStore } from "@/features/projects";
import { downloadSceneFile, restoreSceneFromFile } from "@/features/save-scene/model/saveSceneFile";
import { Button, ConfirmDialog, Modal, Panel } from "@/shared/ui";
import type { DrawToolWorkspace } from "@/entities/workspace";
import { parseWorkspaceFile } from "../model/parseWorkspaceFile";
import { workspacePersistenceStore } from "../model/workspacePersistenceStore";
import { downloadWorkspaceExport } from "../model/workspaceTransfer";

type WorkspaceDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function formatSavedAt(value: string | null) {
  if (!value) return "ещё не сохранялось";
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function WorkspaceDataModal({ isOpen, onClose }: WorkspaceDataModalProps) {
  const newProjectInputRef = useRef<HTMLInputElement | null>(null);
  const replaceSceneInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceInputRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingWorkspace, setPendingWorkspace] = useState<DrawToolWorkspace | null>(null);
  const [folderWorkspace, setFolderWorkspace] = useState<DrawToolWorkspace | null>(null);
  const [isReading, setIsReading] = useState(false);

  const storage = useSyncExternalStore(
    workspacePersistenceStore.subscribe,
    workspacePersistenceStore.get,
    workspacePersistenceStore.get,
  );
  const projects = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.get,
    projectStore.get,
  );

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function runAction(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Не удалось выполнить действие.");
    }
  }

  async function handleConnectFolder() {
    const result = await workspacePersistenceStore.connectFolder();
    if (result.kind === "existing") {
      setFolderWorkspace(result.snapshot.workspace);
      return;
    }
    if (result.kind === "empty") {
      showNotice("Папка подключена. Текущая рабочая область сохранена в ней.");
    }
  }

  async function handleNewProjectImport(file: File | undefined) {
    if (!file) return;
    setIsReading(true);
    try {
      await restoreSceneFromFile(file);
      await workspacePersistenceStore.saveNow();
      showNotice("Проект импортирован.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Не удалось импортировать проект.");
    } finally {
      setIsReading(false);
      if (newProjectInputRef.current) newProjectInputRef.current.value = "";
    }
  }

  async function handleReplaceScene(file: File | undefined) {
    if (!file) return;
    setIsReading(true);
    try {
      importScene(await parseSceneFile(file));
      await workspacePersistenceStore.saveNow();
      showNotice("Текущая доска заменена.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Не удалось импортировать доску.");
    } finally {
      setIsReading(false);
      if (replaceSceneInputRef.current) replaceSceneInputRef.current.value = "";
    }
  }

  async function handleWorkspaceImport(file: File | undefined) {
    if (!file) return;
    setIsReading(true);
    try {
      setPendingWorkspace(await parseWorkspaceFile(file));
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Не удалось прочитать резервную копию.");
    } finally {
      setIsReading(false);
      if (workspaceInputRef.current) workspaceInputRef.current.value = "";
    }
  }

  async function downloadGraphic(format: "png" | "svg") {
    const elements = sceneStore.get().elements;
    const file = format === "png" ? await exportToPng(elements) : exportToSvg(elements);
    downloadFile(file.blob, file.fileName);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Хранилище и резервные копии">
        <div className="space-y-4">
          <Panel className="rounded-xl border border-border bg-control/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-sm font-semibold text-text">Backup-папка</h3>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  {storage.isConnected
                    ? `Подключена: ${storage.folderName}. Последнее сохранение: ${formatSavedAt(storage.lastSavedAt)}.`
                    : "Проекты остаются в IndexedDB браузера. Подключите папку для внешнего backup и переноса между компьютерами."}
                </p>
              </div>
              {storage.isConnected ? (
                <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-medium text-emerald-300">Подключена</span>
              ) : null}
            </div>

            {!storage.isSupported ? (
              <p className="mt-3 rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-2 text-xs leading-5 text-amber-200">
                Выбор папки доступен в Chrome и Edge на компьютере. В этом браузере используйте экспорт JSON.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  className="flex items-center justify-center gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted"
                  disabled={storage.isBusy}
                  onClick={() => void handleConnectFolder()}
                  type="button"
                >
                  {storage.isBusy ? <LoaderCircle aria-hidden className="animate-spin" size={16} /> : <FolderOpen aria-hidden size={16} />}
                  {storage.isConnected ? "Сменить папку" : "Выбрать папку"}
                </Button>
                {storage.status === "access-needed" ? (
                  <Button
                    className="rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted"
                    disabled={storage.isBusy}
                    onClick={() => void workspacePersistenceStore.reconnectPersistedFolder()}
                    type="button"
                  >
                    Разрешить доступ
                  </Button>
                ) : null}
                {storage.isConnected ? (
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted"
                    disabled={storage.isBusy}
                    onClick={() => void runAction(async () => { await workspacePersistenceStore.createBackup(); })}
                    type="button"
                  >
                    <Download aria-hidden size={16} />
                    Создать backup
                  </Button>
                ) : null}
                {storage.isConnected ? (
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-red-500/10 hover:text-red-300"
                    disabled={storage.isBusy}
                    onClick={() => void workspacePersistenceStore.disconnectFolder()}
                    type="button"
                  >
                    <Unplug aria-hidden size={16} />
                    Отключить
                  </Button>
                ) : null}
              </div>
            )}
            {storage.message ? <p className="mt-3 text-xs text-red-300">{storage.message}</p> : null}
          </Panel>

          <Panel className="rounded-xl border border-border bg-control/35 p-3">
            <h3 className="m-0 text-sm font-semibold text-text">Экспорт</h3>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Сцена — это только текущая доска. Полный backup включает все {projects.projects.length} проектов, viewport и настройки инструментов.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" onClick={downloadSceneFile} type="button">
                <Download aria-hidden size={16} /> Текущий проект JSON
              </Button>
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" onClick={() => void downloadWorkspaceExport()} type="button">
                <Download aria-hidden size={16} /> Все проекты и настройки
              </Button>
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" onClick={() => void downloadGraphic("png")} type="button">
                <ImageDown aria-hidden size={16} /> Скачать PNG
              </Button>
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" onClick={() => void downloadGraphic("svg")} type="button">
                <ImageDown aria-hidden size={16} /> Скачать SVG
              </Button>
            </div>
          </Panel>

          <Panel className="rounded-xl border border-border bg-control/35 p-3">
            <h3 className="m-0 text-sm font-semibold text-text">Импорт</h3>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Выберите, добавить ли отдельную сцену новым проектом, заменить активную доску или восстановить всю рабочую область.
            </p>
            <input accept="application/json,.json" className="hidden" onChange={(event) => void handleNewProjectImport(event.currentTarget.files?.[0])} ref={newProjectInputRef} type="file" />
            <input accept="application/json,.json" className="hidden" onChange={(event) => void handleReplaceScene(event.currentTarget.files?.[0])} ref={replaceSceneInputRef} type="file" />
            <input accept="application/json,.json" className="hidden" onChange={(event) => void handleWorkspaceImport(event.currentTarget.files?.[0])} ref={workspaceInputRef} type="file" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" disabled={isReading} onClick={() => newProjectInputRef.current?.click()} type="button">
                <FilePlus2 aria-hidden size={16} /> Импортировать как новый
              </Button>
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted" disabled={isReading} onClick={() => replaceSceneInputRef.current?.click()} type="button">
                <Replace aria-hidden size={16} /> Заменить текущую доску
              </Button>
              <Button className="justify-start gap-2 rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted sm:col-span-2" disabled={isReading} onClick={() => workspaceInputRef.current?.click()} type="button">
                {isReading ? <LoaderCircle aria-hidden className="animate-spin" size={16} /> : <FileUp aria-hidden size={16} />} Импортировать все проекты и настройки
              </Button>
            </div>
          </Panel>

          {notice ? <p className="m-0 rounded-lg border border-border bg-panel px-3 py-2 text-xs text-text">{notice}</p> : null}
        </div>
      </Modal>

      <ConfirmDialog
        confirmLabel="Заменить проекты"
        description={pendingWorkspace ? `Будут заменены все текущие проекты и настройки. В резервной копии: ${pendingWorkspace.projects.length} проект(а).` : ""}
        isOpen={pendingWorkspace !== null}
        onCancel={() => setPendingWorkspace(null)}
        onConfirm={() => {
          const workspace = pendingWorkspace;
          setPendingWorkspace(null);
          if (workspace) void runAction(async () => { await workspacePersistenceStore.restoreWorkspace(workspace); });
        }}
        title="Импортировать резервную копию?"
      />

      <Modal isOpen={folderWorkspace !== null} onClose={() => setFolderWorkspace(null)} title="В папке найдена рабочая область">
        <p className="m-0 text-sm leading-6 text-text-muted">
          В папке есть backup с {folderWorkspace?.projects.length ?? 0} проектами. Открыть его или перезаписать папку текущими данными DrawTool?
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:brightness-110"
            onClick={() => {
              const workspace = folderWorkspace;
              setFolderWorkspace(null);
              if (workspace) void runAction(async () => { await workspacePersistenceStore.restoreWorkspace(workspace); });
            }}
            type="button"
          >
            Открыть данные из папки
          </Button>
          <Button
            className="rounded-lg bg-control px-3 py-2 text-sm text-text hover:bg-surface-muted"
            onClick={() => {
              setFolderWorkspace(null);
              void runAction(async () => { await workspacePersistenceStore.overwriteConnectedFolder(); });
            }}
            type="button"
          >
            Перезаписать папку
          </Button>
        </div>
      </Modal>
    </>
  );
}
