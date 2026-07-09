import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  Copy,
  Download,
  FileJson,
  Focus,
  Group,
  Image,
  Lock,
  LockOpen,
  PackagePlus,
  PackageOpen,
  Tags,
  Ungroup,
  Trash2,
} from "lucide-react";
import { boardActions } from "@/features/board-actions";
import { componentLibraryDialogStore } from "@/features/component-library";
import { Button, Divider, Popover } from "@/shared/ui";
import { deleteSelectedElements } from "@/features/delete-elements";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import type { BoardElement } from "@/entities/element";

type BoardContextMenuProps = {
  left: number;
  onClose: () => void;
  targetElementId?: string;
  targetIsLocked?: boolean;
  top: number;
};

function canUseLabel(element: BoardElement) {
  return (
    element.type === "rectangle" ||
    element.type === "badge" ||
    element.type === "ellipse" ||
    element.type === "diamond" ||
    element.type === "triangle" ||
    element.type === "hexagon" ||
    element.type === "star" ||
    element.type === "cloud" ||
    element.type === "line" ||
    element.type === "arrow"
  );
}

export function BoardContextMenu({
  left,
  onClose,
  targetElementId,
  targetIsLocked = false,
  top,
}: BoardContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const scene = useSyncExternalStore(
    sceneStore.subscribe,
    sceneStore.get,
    sceneStore.get,
  );
  const selection = useSyncExternalStore(
    selectionStore.subscribeElementIds,
    selectionStore.get,
    selectionStore.get,
  );
  const selectedElements = scene.elements.filter((element) =>
    selection.elementIds.includes(element.id),
  );
  const showLabelAction = selectedElements.some(canUseLabel);
  const showAlignActions = selectedElements.length >= 2;
  const showDistributeActions = selectedElements.length >= 3;
  const hasSelectedFrame = selectedElements.some(
    (element) => element.type === "frame",
  );
  const hasGroupSelection = selectedElements.length >= 2;
  const hasGroupedSelection = selectedElements.some(
    (element) => element.groupId,
  );
  const hasSelection = selectedElements.length > 0;
  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-text hover:bg-control";
  const width = 256;
  const gutter = 8;
  const maxHeight = Math.min(310, window.innerHeight - gutter * 2);
  const menuLeft = Math.max(
    gutter,
    Math.min(left, window.innerWidth - width - gutter),
  );
  const menuTop = Math.max(
    gutter,
    Math.min(top, window.innerHeight - maxHeight - gutter),
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && !menuRef.current?.contains(target)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function run(action: () => unknown | Promise<unknown>) {
    void Promise.resolve(action()).catch(() => undefined);
    onClose();
  }

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-120"
      style={{ left: menuLeft, top: menuTop }}
    >
      <Popover
        aria-label="Контекстное меню доски"
        className="w-64 overflow-y-auto overscroll-contain"
        isOpen
        role="menu"
        style={{ maxHeight }}
      >
        {showLabelAction && (
          <Button
            className={itemClass}
            onClick={() => {
              const label = window.prompt(
                "Подпись для выбранных элементов",
                "",
              );
              if (label !== null)
                run(() => boardActions.setSelectionLabel(label));
            }}
            type="button"
          >
            <Tags size={16} />
            <span>Подпись / label</span>
          </Button>
        )}

        {hasGroupSelection && (
          <Button
            className={itemClass}
            onClick={() => run(boardActions.groupSelection)}
            type="button"
          >
            <Group size={16} />
            <span>Сгруппировать</span>
          </Button>
        )}
        {hasGroupedSelection && (
          <Button
            className={itemClass}
            onClick={() => run(boardActions.ungroupSelection)}
            type="button"
          >
            <Ungroup size={16} />
            <span>Разгруппировать</span>
          </Button>
        )}
        {(hasSelection || targetElementId) && (
          <Button
            className={itemClass}
            onClick={() =>
              run(() => boardActions.toggleLockSelection(targetElementId))
            }
            type="button"
          >
            {targetIsLocked ? <LockOpen size={16} /> : <Lock size={16} />}
            <span>{targetIsLocked ? "Unlock" : "Lock"}</span>
          </Button>
        )}

        {showAlignActions && <Divider className="my-1.5" />}

        {showAlignActions && (
          <>
            <Button
              className={itemClass}
              onClick={() => run(() => boardActions.alignSelection("left"))}
              type="button"
            >
              <AlignLeft size={16} />
              <span>Выровнять слева</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() => run(() => boardActions.alignSelection("center"))}
              type="button"
            >
              <AlignCenter size={16} />
              <span>Выровнять по центру</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() => run(() => boardActions.alignSelection("right"))}
              type="button"
            >
              <AlignRight size={16} />
              <span>Выровнять справа</span>
            </Button>
          </>
        )}

        {showDistributeActions && (
          <>
            <Button
              className={itemClass}
              onClick={() =>
                run(() => boardActions.distributeSelection("horizontal"))
              }
              type="button"
            >
              <AlignHorizontalDistributeCenter size={16} />
              <span>Распределить горизонтально</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() =>
                run(() => boardActions.distributeSelection("vertical"))
              }
              type="button"
            >
              <AlignVerticalDistributeCenter size={16} />
              <span>Распределить вертикально</span>
            </Button>
          </>
        )}

        {hasSelection && (
          <>
            <Divider className="my-1.5" />
            <Button
              className={itemClass}
              onClick={() => run(boardActions.copySelectionToClipboard)}
              type="button"
            >
              <Copy size={16} />
              <span>Copy JSON</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() => run(boardActions.copySelectionAsPng)}
              type="button"
            >
              <Image size={16} />
              <span>Copy PNG</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() => run(boardActions.copySelectionAsSvg)}
              type="button"
            >
              <FileJson size={16} />
              <span>Copy SVG</span>
            </Button>
          </>
        )}

        {hasSelection && (
          <Button
            className={itemClass}
            onClick={() => {
              const name = window.prompt("Название компонента", "Компонент");
              if (name !== null)
                run(() => boardActions.saveSelectionToLibrary(name));
            }}
            type="button"
          >
            <PackagePlus size={16} />
            <span>В библиотеку</span>
          </Button>
        )}
        <Button
          className={itemClass}
          onClick={() => run(componentLibraryDialogStore.open)}
          type="button"
        >
          <PackageOpen size={16} />
          <span>Компоненты</span>
        </Button>

        {hasSelectedFrame && (
          <>
            <Divider className="my-1.5" />
            <Button
              className={itemClass}
              onClick={() => run(boardActions.focusSelectedFrame)}
              type="button"
            >
              <Focus size={16} />
              <span>Фокус на фрейм</span>
            </Button>
            <Button
              className={itemClass}
              onClick={() => run(() => boardActions.exportSelectedFrame("png"))}
              type="button"
            >
              <Download size={16} />
              <span>Export frame PNG</span>
            </Button>
          </>
        )}
        <Button
          className={`${itemClass} text-red-500! hover:bg-red-500/15 hover:text-red-200`}
          onClick={() => run(deleteSelectedElements)}
          disabled={!hasSelection}
          type="button"
        >
          <Trash2 size={16} />
          <span>Удалить выбранное</span>
        </Button>
      </Popover>
    </div>,
    document.body,
  );
}
