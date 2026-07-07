import {
  createElement,
  DEFAULT_ELEMENT_STYLE,
  getElementBounds,
  updateElement,
  type BoardElement,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore, serializeScene } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { viewportStore } from "@/entities/viewport";
import { downloadFile, exportToJson, exportToPng, exportToSvg } from "@/features/export-scene";
import { createId } from "@/shared/lib";

type ClipboardPayload = {
  format: "drawtool-elements";
  version: 1;
  elements: BoardElement[];
};

type LibraryItem = {
  id: string;
  name: string;
  elements: BoardElement[];
  createdAt: number;
};

export type AlignCommand =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export type DistributeCommand = "horizontal" | "vertical";

const CLIPBOARD_FORMAT = "drawtool-elements";
const LIBRARY_STORAGE_KEY = "drawtool.componentLibrary.v1";
const SHARE_HASH_PREFIX = "scene=";

function cloneElements(elements: BoardElement[]) {
  return JSON.parse(JSON.stringify(elements)) as BoardElement[];
}

function getSelectedElements() {
  const selectedIds = new Set(selectionStore.get().elementIds);
  return sceneStore.get().elements.filter((element) => selectedIds.has(element.id));
}

function canUseLabel(element: BoardElement) {
  return (
    element.type === "rectangle" ||
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

function getElementsByIds(elementIds: string[]) {
  const ids = new Set(elementIds);
  return sceneStore.get().elements.filter((element) => ids.has(element.id));
}

function getElementsBounds(elements: BoardElement[]) {
  if (elements.length === 0) return null;
  const bounds = elements.map(getElementBounds);
  const left = Math.min(...bounds.map((item) => item.x));
  const top = Math.min(...bounds.map((item) => item.y));
  const right = Math.max(...bounds.map((item) => item.x + item.width));
  const bottom = Math.max(...bounds.map((item) => item.y + item.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function getFrameExportElements(frame: BoardElement) {
  const frameBounds = getElementBounds(frame);
  return sceneStore.get().elements.filter((element) => {
    if (element.id === frame.id) return true;
    const bounds = getElementBounds(element);
    return (
      bounds.x >= frameBounds.x &&
      bounds.y >= frameBounds.y &&
      bounds.x + bounds.width <= frameBounds.x + frameBounds.width &&
      bounds.y + bounds.height <= frameBounds.y + frameBounds.height
    );
  });
}

function getSelectedFrame() {
  return getSelectedElements().find((element) => element.type === "frame") ?? null;
}

function normalizeInsertedElements(elements: BoardElement[], offset = 32) {
  const idMap = new Map<string, string>();

  elements.forEach((element) => {
    idMap.set(element.id, createId(element.type));
  });

  return elements.map((element) => ({
    ...element,
    id: idMap.get(element.id) ?? createId(element.type),
    x: element.x + offset,
    y: element.y + offset,
    groupId: element.groupId ? createId("group") : undefined,
    parentId: element.parentId ? idMap.get(element.parentId) : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })) as BoardElement[];
}

function encodeSharePayload(elements: BoardElement[]) {
  const json = JSON.stringify(serializeScene(elements));
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeSharePayload(payload: string) {
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function readLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LibraryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLibrary(items: LibraryItem[]) {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
}

const SNAPSHOT_STORAGE_KEY = "drawtool.snapshots.v1";
const BRAND_KIT_STORAGE_KEY = "drawtool.brandKit.v1";

type SnapshotItem = {
  id: string;
  name: string;
  createdAt: number;
  elements: BoardElement[];
};

function readSnapshots(): SnapshotItem[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SnapshotItem[]) : [];
  } catch {
    return [];
  }
}

function writeSnapshots(items: SnapshotItem[]) {
  localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(items));
}

function createTemplateElements(template: "flowchart" | "mindmap" | "roadmap") {
  const baseStyle = {
    ...DEFAULT_ELEMENT_STYLE,
    strokeColor: "#93c5fd",
    backgroundColor: "#0f172a",
    fillStyle: "solid" as const,
    cornerStyle: "rounded" as const,
  };
  const now = Date.now();
  const make = (
    type: Exclude<BoardElement["type"], "image"> | "advanced",
    x: number,
    y: number,
    label: string,
  ) => ({
    ...createElement(type, {
      x,
      y,
      width: 180,
      height: 86,
      style: baseStyle,
      kind: type === "advanced" ? "mindmap-node" : undefined,
    }),
    label,
    createdAt: now,
    updatedAt: now,
  });

  if (template === "mindmap") {
    return [
      make("ellipse", 80, 80, "Main idea"),
      make("advanced", 340, 20, "Branch A"),
      make("advanced", 340, 160, "Branch B"),
    ];
  }

  if (template === "roadmap") {
    return [
      make("advanced", 80, 80, "Q1"),
      make("advanced", 340, 80, "Q2"),
      make("advanced", 600, 80, "Launch"),
    ];
  }

  return [
    make("rectangle", 80, 80, "Start"),
    make("diamond", 340, 80, "Decision"),
    make("rectangle", 600, 80, "Done"),
  ];
}

export const boardActions = {
  copySelectionToClipboard() {
    const elements = getSelectedElements();
    if (elements.length === 0 || !navigator.clipboard?.writeText) return false;
    const payload: ClipboardPayload = {
      format: CLIPBOARD_FORMAT,
      version: 1,
      elements: cloneElements(elements),
    };
    void navigator.clipboard.writeText(JSON.stringify(payload));
    return true;
  },

  async pasteElementsFromClipboard() {
    const text = await navigator.clipboard?.readText?.();
    if (!text) return false;
    let parsed: ClipboardPayload;

    try {
      parsed = JSON.parse(text) as ClipboardPayload;
      if (parsed.format !== CLIPBOARD_FORMAT || !Array.isArray(parsed.elements)) {
        return false;
      }
    } catch {
      return false;
    }

    const elements = normalizeInsertedElements(parsed.elements);
    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  async copySelectionAsPng() {
    const elements = getSelectedElements();
    if (
      elements.length === 0 ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === "undefined"
    ) {
      return false;
    }
    const file = await exportToPng(elements, { fileName: "drawtool-selection.png" });
    await navigator.clipboard.write([
      new ClipboardItem({ [file.mimeType]: file.blob }),
    ]);
    return true;
  },

  async copySelectionAsSvg() {
    const elements = getSelectedElements();
    if (elements.length === 0 || !navigator.clipboard?.writeText) return false;
    const file = exportToSvg(elements, { fileName: "drawtool-selection.svg" });
    await navigator.clipboard.writeText(await file.blob.text());
    return true;
  },

  groupSelection() {
    const elements = getSelectedElements().filter((element) => !element.locked);
    if (elements.length < 2) return false;
    const groupId = createId("group");
    historyStore.begin();
    sceneStore.updateAll((element) =>
      elements.some((item) => item.id === element.id)
        ? updateElement(element, { groupId })
        : element,
    );
    historyStore.commit();
    return true;
  },

  ungroupSelection() {
    const ids = new Set(selectionStore.get().elementIds);
    historyStore.begin();
    sceneStore.updateAll((element) =>
      ids.has(element.id) && element.groupId
        ? updateElement(element, { groupId: undefined })
        : element,
    );
    historyStore.commit();
    return true;
  },

  toggleLockSelection(targetElementId?: string) {
    const elements = targetElementId
      ? getElementsByIds([targetElementId])
      : getSelectedElements();
    if (elements.length === 0) return false;
    const shouldLock = elements.some((element) => !element.locked);
    const elementIds = elements.map((element) => element.id);
    historyStore.begin();
    sceneStore.updateAll((element) =>
      elements.some((item) => item.id === element.id)
        ? updateElement(element, { locked: shouldLock })
        : element,
    );
    if (shouldLock) {
      selectionStore.clear();
    } else {
      selectionStore.setElementIds(elementIds);
    }
    historyStore.commit();
    return true;
  },

  alignSelection(command: AlignCommand) {
    const elements = getSelectedElements().filter((element) => !element.locked);
    const selectionBounds = getElementsBounds(elements);
    if (!selectionBounds || elements.length < 2) return false;

    historyStore.begin();
    sceneStore.updateAll((element) => {
      if (!elements.some((item) => item.id === element.id)) return element;
      const bounds = getElementBounds(element);
      const patch: Partial<Pick<BoardElement, "x" | "y">> = {};

      if (command === "left") patch.x = element.x + selectionBounds.x - bounds.x;
      if (command === "center") patch.x = element.x + selectionBounds.x + selectionBounds.width / 2 - (bounds.x + bounds.width / 2);
      if (command === "right") patch.x = element.x + selectionBounds.x + selectionBounds.width - (bounds.x + bounds.width);
      if (command === "top") patch.y = element.y + selectionBounds.y - bounds.y;
      if (command === "middle") patch.y = element.y + selectionBounds.y + selectionBounds.height / 2 - (bounds.y + bounds.height / 2);
      if (command === "bottom") patch.y = element.y + selectionBounds.y + selectionBounds.height - (bounds.y + bounds.height);

      return updateElement(element, patch);
    });
    historyStore.commit();
    return true;
  },

  distributeSelection(command: DistributeCommand) {
    const elements = getSelectedElements().filter((element) => !element.locked);
    if (elements.length < 3) return false;
    const sorted = [...elements].sort((a, b) => {
      const aBounds = getElementBounds(a);
      const bBounds = getElementBounds(b);
      return command === "horizontal" ? aBounds.x - bBounds.x : aBounds.y - bBounds.y;
    });
    const first = getElementBounds(sorted[0]);
    const last = getElementBounds(sorted[sorted.length - 1]);
    const span = command === "horizontal"
      ? last.x - first.x
      : last.y - first.y;
    const step = span / (sorted.length - 1);
    const targetById = new Map<string, number>();
    sorted.forEach((element, index) => {
      targetById.set(
        element.id,
        (command === "horizontal" ? first.x : first.y) + step * index,
      );
    });

    historyStore.begin();
    sceneStore.updateAll((element) => {
      const target = targetById.get(element.id);
      if (target === undefined) return element;
      const bounds = getElementBounds(element);
      return command === "horizontal"
        ? updateElement(element, { x: element.x + target - bounds.x })
        : updateElement(element, { y: element.y + target - bounds.y });
    });
    historyStore.commit();
    return true;
  },

  setSelectionLabel(label: string) {
    const elements = getSelectedElements().filter(
      (element) => !element.locked && canUseLabel(element),
    );
    if (elements.length === 0) return false;
    historyStore.begin();
    sceneStore.updateAll((element) =>
      elements.some((item) => item.id === element.id)
        ? updateElement(element, { label: label.trim() || undefined })
        : element,
    );
    historyStore.commit();
    return true;
  },

  saveSelectionToLibrary(name = "Компонент") {
    const elements = getSelectedElements();
    if (elements.length === 0) return false;
    const items = readLibrary();
    writeLibrary([
      {
        id: createId("library"),
        name,
        elements: cloneElements(elements),
        createdAt: Date.now(),
      },
      ...items,
    ].slice(0, 24));
    return true;
  },

  insertLatestLibraryItem() {
    const [item] = readLibrary();
    if (!item) return false;
    const elements = normalizeInsertedElements(item.elements, 48);
    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  async exportSelectedFrame(format: "png" | "svg" | "json") {
    const frame = getSelectedFrame();
    if (!frame) return false;
    const elements = getFrameExportElements(frame);
    const fileName = `${frame.type}-${frame.id}`;
    const file = format === "png"
      ? await exportToPng(elements, { fileName: `${fileName}.png` })
      : format === "svg"
        ? exportToSvg(elements, { fileName: `${fileName}.svg` })
        : exportToJson(elements, { fileName: `${fileName}.json` });
    downloadFile(file.blob, file.fileName);
    return true;
  },

  focusSelectedFrame() {
    const frame = getSelectedFrame();
    if (!frame) return false;
    const bounds = getElementBounds(frame);
    const zoom = Math.max(
      0.2,
      Math.min(
        2,
        Math.min(window.innerWidth / (bounds.width + 160), window.innerHeight / (bounds.height + 160)),
      ),
    );
    viewportStore.set({
      x: bounds.x + bounds.width / 2 - window.innerWidth / 2 / zoom,
      y: bounds.y + bounds.height / 2 - window.innerHeight / 2 / zoom,
      zoom,
    });
    return true;
  },

  async copyReadonlyShareLink() {
    if (!navigator.clipboard?.writeText) return false;
    const payload = encodeSharePayload(sceneStore.get().elements);
    const url = `${window.location.origin}${window.location.pathname}#${SHARE_HASH_PREFIX}${payload}`;
    await navigator.clipboard.writeText(url);
    return true;
  },

  restoreSceneFromShareHash() {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith(SHARE_HASH_PREFIX)) return false;
    try {
      const source = decodeSharePayload(hash.slice(SHARE_HASH_PREFIX.length));
      const parsed = JSON.parse(source) as ReturnType<typeof serializeScene>;
      if (!Array.isArray(parsed.elements)) return false;
      historyStore.begin();
      sceneStore.setElements(parsed.elements);
      selectionStore.clear();
      historyStore.commit();
      return true;
    } catch {
      return false;
    }
  },

  insertTemplate(template: "flowchart" | "mindmap" | "roadmap") {
    const elements = createTemplateElements(template);
    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  createSnapshot(name = "Checkpoint") {
    const snapshots = readSnapshots();
    writeSnapshots([
      {
        id: createId("snapshot"),
        name,
        createdAt: Date.now(),
        elements: cloneElements(sceneStore.get().elements),
      },
      ...snapshots,
    ].slice(0, 12));
    return true;
  },

  restoreLatestSnapshot() {
    const [snapshot] = readSnapshots();
    if (!snapshot) return false;
    historyStore.begin();
    sceneStore.setElements(snapshot.elements);
    selectionStore.clear();
    historyStore.commit();
    return true;
  },

  runDiagramDiagnostics() {
    const elements = sceneStore.get().elements;
    const emptyLabels = elements.filter((element) =>
      ["arrow", "diamond", "advanced"].includes(element.type) && !element.label && !("title" in element),
    ).length;
    const locked = elements.filter((element) => element.locked).length;
    const tiny = elements.filter((element) => {
      const bounds = getElementBounds(element);
      return bounds.width < 12 || bounds.height < 12;
    }).length;

    return [
      `Элементов: ${elements.length}`,
      `Locked: ${locked}`,
      `Очень маленьких: ${tiny}`,
      `Без подписи: ${emptyLabels}`,
    ];
  },

  applyBrandKit() {
    const brand = {
      strokeColor: "#22c55e",
      backgroundColor: "#052e16",
    };
    localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(brand));
    const elements = getSelectedElements();
    if (elements.length === 0) return false;
    historyStore.begin();
    sceneStore.updateAll((element) =>
      elements.some((item) => item.id === element.id)
        ? updateElement(element, {
            style: {
              ...element.style,
              ...brand,
              fillStyle: "solid",
            },
          })
        : element,
    );
    historyStore.commit();
    return true;
  },
};
