import {
  createArrowBinding,
  createElement,
  DEFAULT_ELEMENT_STYLE,
  getElementBounds,
  getElementCenter,
  updateElement,
  type ArrowCornerStyle,
  type BoardElement,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { deserializeScene, sceneStore, serializeScene } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { viewportStore } from "@/entities/viewport";
import {
  downloadFile,
  exportToJson,
  exportToPng,
  exportToSvg,
} from "@/features/export-scene";
import { createId } from "@/shared/lib";

type ClipboardPayload = {
  format: "drawtool-elements";
  version: 1;
  elements: BoardElement[];
};

export type LibraryItem = {
  id: string;
  name: string;
  elements: BoardElement[];
  createdAt: number;
};

export type ElementSearchResult = {
  id: string;
  label: string;
  meta: string;
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
  return sceneStore
    .get()
    .elements.filter((element) => selectedIds.has(element.id));
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
  return (
    getSelectedElements().find((element) => element.type === "frame") ?? null
  );
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
const DRAWTOOL_FILE_FORMAT = "drawtool-file";

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

function getInsertionPoint() {
  const viewport = viewportStore.get();
  return {
    x: viewport.x + window.innerWidth / viewport.zoom / 2 - 160,
    y: viewport.y + window.innerHeight / viewport.zoom / 2 - 100,
  };
}

function getElementText(element: BoardElement) {
  const tags = element.tags?.join(" ") ?? "";
  const metadata = element.metadata
    ? Object.entries(element.metadata)
        .map(([key, value]) => `${key} ${value}`)
        .join(" ")
    : "";
  const suffix = `${tags} ${metadata}`.trim();
  const withMeta = (value: string) => `${value}\n${suffix}`.trim();

  if ("label" in element && element.label) return withMeta(element.label);
  if (element.type === "frame") return withMeta(element.name);
  if (element.type === "embed") return withMeta(element.title ?? element.url);
  if (element.type === "markdown")
    return withMeta(`${element.title}\n${element.content}`);
  if (
    element.type === "text" ||
    element.type === "sticky" ||
    element.type === "callout"
  )
    return withMeta(element.text);
  if (element.type === "table") return withMeta(element.cells.join("\n"));
  if (element.type === "code" && "kind" in element)
    return withMeta(`${element.title}\n${element.body.join("\n")}`);
  if (element.type === "code")
    return withMeta(`${element.title}\n${element.language}\n${element.code}`);
  if (element.type === "image") return withMeta(element.name);
  return withMeta(element.type);
}

function getMidpointBetween(
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  return {
    x: start.x + (end.x - start.x) / 2,
    y: start.y + (end.y - start.y) / 2,
  };
}

function parseCsvRows(source: string) {
  return source
    .trim()
    .split(/\r?\n/)
    .map((line) =>
      line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")),
    )
    .filter((row) => row.some(Boolean));
}

function createBoundArrow(
  startElement: BoardElement,
  endElement: BoardElement,
  label?: string,
) {
  const start = getElementCenter(startElement);
  const end = getElementCenter(endElement);
  const arrow = createElement("arrow", {
    x: start.x,
    y: start.y,
    width: end.x - start.x,
    height: end.y - start.y,
    routing: "curve",
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      strokeColor: "#93c5fd",
      fillStyle: "transparent",
    },
  });

  if (arrow.type !== "arrow") {
    return arrow;
  }

  return updateElement(arrow, {
    label,
    startBinding: createArrowBinding(startElement, start),
    endBinding: createArrowBinding(endElement, end),
  });
}

function cleanDiagramNodeName(value: string) {
  return value
    .trim()
    .replace(/^[A-Za-z0-9_]+\s*\[/, "")
    .replace(/\]$/, "")
    .replace(/^[A-Za-z0-9_]+\s*\(/, "")
    .replace(/\)$/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function parseDiagramEdges(source: string) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("%%") && !line.startsWith("#"))
    .map((line) => line.replace(/^flowchart\s+\w+/i, "").trim())
    .map((line) => {
      const match = line.match(/^(.+?)\s*(?:-->|---|->|=>)\s*(.+)$/);
      if (!match) return null;
      return {
        from: cleanDiagramNodeName(match[1]),
        to: cleanDiagramNodeName(match[2]),
      };
    })
    .filter((edge): edge is { from: string; to: string } =>
      Boolean(edge?.from && edge.to),
    );
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

const MAX_WAYPOINTS = 10;

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
      if (
        parsed.format !== CLIPBOARD_FORMAT ||
        !Array.isArray(parsed.elements)
      ) {
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
    const file = await exportToPng(elements, {
      fileName: "drawtool-selection.png",
    });
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

      if (command === "left")
        patch.x = element.x + selectionBounds.x - bounds.x;
      if (command === "center")
        patch.x =
          element.x +
          selectionBounds.x +
          selectionBounds.width / 2 -
          (bounds.x + bounds.width / 2);
      if (command === "right")
        patch.x =
          element.x +
          selectionBounds.x +
          selectionBounds.width -
          (bounds.x + bounds.width);
      if (command === "top") patch.y = element.y + selectionBounds.y - bounds.y;
      if (command === "middle")
        patch.y =
          element.y +
          selectionBounds.y +
          selectionBounds.height / 2 -
          (bounds.y + bounds.height / 2);
      if (command === "bottom")
        patch.y =
          element.y +
          selectionBounds.y +
          selectionBounds.height -
          (bounds.y + bounds.height);

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
      return command === "horizontal"
        ? aBounds.x - bBounds.x
        : aBounds.y - bBounds.y;
    });
    const first = getElementBounds(sorted[0]);
    const last = getElementBounds(sorted[sorted.length - 1]);
    const span = command === "horizontal" ? last.x - first.x : last.y - first.y;
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
    writeLibrary(
      [
        {
          id: createId("library"),
          name,
          elements: cloneElements(elements),
          createdAt: Date.now(),
        },
        ...items,
      ].slice(0, 24),
    );
    return true;
  },

  getLibraryItems() {
    return readLibrary().map((item) => ({
      ...item,
      elements: cloneElements(item.elements),
    }));
  },

  insertLibraryItem(itemId: string) {
    const item = readLibrary().find((libraryItem) => libraryItem.id === itemId);
    if (!item) return false;

    const elements = normalizeInsertedElements(item.elements, 48);
    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  deleteLibraryItem(itemId: string) {
    const items = readLibrary();
    const nextItems = items.filter((item) => item.id !== itemId);
    if (nextItems.length === items.length) return false;

    writeLibrary(nextItems);
    return true;
  },

  async exportSelectedFrame(format: "png" | "svg" | "json") {
    const frame = getSelectedFrame();
    if (!frame) return false;
    const elements = getFrameExportElements(frame);
    const fileName = `${frame.type}-${frame.id}`;
    const file =
      format === "png"
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
        Math.min(
          window.innerWidth / (bounds.width + 160),
          window.innerHeight / (bounds.height + 160),
        ),
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
    writeSnapshots(
      [
        {
          id: createId("snapshot"),
          name,
          createdAt: Date.now(),
          elements: cloneElements(sceneStore.get().elements),
        },
        ...snapshots,
      ].slice(0, 12),
    );
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

  getSnapshots() {
    return readSnapshots();
  },

  restoreSnapshot(snapshotId: string) {
    const snapshot = readSnapshots().find((item) => item.id === snapshotId);
    if (!snapshot) return false;
    historyStore.begin();
    sceneStore.setElements(snapshot.elements);
    selectionStore.clear();
    historyStore.commit();
    return true;
  },

  insertMarkdownNote() {
    const point = getInsertionPoint();
    const element = createElement("markdown", {
      x: point.x,
      y: point.y,
      width: 340,
      height: 240,
    });
    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, element]);
    selectionStore.setElementIds([element.id]);
    historyStore.commit();
    return true;
  },

  insertDiagramFromCode(source: string) {
    const edges = parseDiagramEdges(source);
    if (edges.length === 0) return false;

    const names = Array.from(
      new Set(edges.flatMap((edge) => [edge.from, edge.to])),
    );
    const point = getInsertionPoint();
    const nodeByName = new Map<string, BoardElement>();
    const columns = Math.min(
      4,
      Math.max(2, Math.ceil(Math.sqrt(names.length))),
    );
    const nodeElements = names.map((name, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const element = createElement("rectangle", {
        x: point.x + column * 240,
        y: point.y + row * 150,
        width: 180,
        height: 84,
        style: {
          ...DEFAULT_ELEMENT_STYLE,
          strokeColor: "#93c5fd",
          backgroundColor: "#0f172a",
          fillStyle: "solid",
          cornerStyle: "rounded",
        },
      });
      const labeled = updateElement(element, { label: name });
      nodeByName.set(name, labeled);
      return labeled;
    });
    const arrows = edges
      .map((edge) => {
        const start = nodeByName.get(edge.from);
        const end = nodeByName.get(edge.to);
        return start && end ? createBoundArrow(start, end) : null;
      })
      .filter((element): element is BoardElement => Boolean(element));
    const elements = [...nodeElements, ...arrows];

    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  connectSelectionSmart() {
    const elements = getSelectedElements()
      .filter((element) => !element.locked && element.type !== "arrow")
      .sort((left, right) => {
        const leftBounds = getElementBounds(left);
        const rightBounds = getElementBounds(right);
        return leftBounds.x === rightBounds.x
          ? leftBounds.y - rightBounds.y
          : leftBounds.x - rightBounds.x;
      });
    if (elements.length < 2) return false;
    const arrows = elements
      .slice(0, -1)
      .map((element, index) => createBoundArrow(element, elements[index + 1]));

    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...arrows]);
    selectionStore.setElementIds(arrows.map((element) => element.id));
    historyStore.commit();
    return true;
  },

  insertBezierConnector() {
    const point = getInsertionPoint();
    const arrow = createElement("arrow", {
      x: point.x,
      y: point.y,
      width: 320,
      height: 120,
      routing: "curve",
      style: {
        ...DEFAULT_ELEMENT_STYLE,
        strokeColor: "#22c55e",
        fillStyle: "transparent",
        strokeWidth: 5,
      },
    });

    historyStore.begin();
    sceneStore.setElements([
      ...sceneStore.get().elements,
      updateElement(arrow, { label: "Bezier" }),
    ]);
    selectionStore.setElementIds([arrow.id]);
    historyStore.commit();
    return true;
  },

  addWaypointToSelectedArrow() {
    const arrow = getSelectedElements().find(
      (element) => element.type === "arrow",
    );
    if (!arrow || arrow.type !== "arrow") return false;
    if (arrow.routing !== "straight") return false;

    const currentWaypointsCount = arrow.waypoints?.length ?? 0;
    if (currentWaypointsCount >= MAX_WAYPOINTS) return false;

    const points = [
      { x: arrow.x, y: arrow.y },
      ...(arrow.waypoints ?? []),
      { x: arrow.x + arrow.width, y: arrow.y + arrow.height },
    ];
    const segments = points.slice(0, -1).map((start, index) => ({
      end: points[index + 1],
      index,
      length: Math.hypot(
        points[index + 1].x - start.x,
        points[index + 1].y - start.y,
      ),
      start,
    }));
    const target = segments.sort(
      (left, right) => right.length - left.length,
    )[0];
    if (!target) return false;
    const waypoints = [...(arrow.waypoints ?? [])];
    waypoints.splice(
      target.index,
      0,
      getMidpointBetween(target.start, target.end),
    );

    historyStore.begin();
    sceneStore.updateById(arrow.id, (element) =>
      element.type === "arrow"
        ? updateElement(element, { waypoints: waypoints.slice(0, MAX_WAYPOINTS) })
        : element,
    );
    historyStore.commit();
    return true;
  },

  clearSelectedArrowWaypoints() {
    const arrow = getSelectedElements().find(
      (element) => element.type === "arrow",
    );
    if (!arrow || arrow.type !== "arrow" || !arrow.waypoints?.length)
      return false;
    historyStore.begin();
    sceneStore.updateById(arrow.id, (element) =>
      element.type === "arrow"
        ? updateElement(element, { waypoints: undefined })
        : element,
    );
    historyStore.commit();
    return true;
  },

  setSelectedArrowCornerStyle(routeCornerStyle: ArrowCornerStyle) {
    const arrow = getSelectedElements().find(
      (element) => element.type === "arrow",
    );
    if (!arrow || arrow.type !== "arrow") return false;
    if (arrow.routing !== "straight") return false;
    historyStore.begin();
    sceneStore.updateById(arrow.id, (element) =>
      element.type === "arrow"
        ? updateElement(element, { routeCornerStyle })
        : element,
    );
    historyStore.commit();
    return true;
  },

  insertTableFromCsv(source: string) {
    const rows = parseCsvRows(source);
    if (rows.length === 0) return false;
    const columns = Math.max(...rows.map((row) => row.length));
    const cells = rows.flatMap((row) =>
      Array.from({ length: columns }, (_, index) => row[index] ?? ""),
    );
    const point = getInsertionPoint();
    const table = createElement("table", {
      x: point.x,
      y: point.y,
      width: Math.max(280, columns * 140),
      height: Math.max(120, rows.length * 48),
      rows: rows.length,
      columns,
      cells,
    });

    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, table]);
    selectionStore.setElementIds([table.id]);
    historyStore.commit();
    return true;
  },

  searchElements(query: string): ElementSearchResult[] {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return sceneStore
      .get()
      .elements.map((element) => {
        const text = getElementText(element);
        return {
          element,
          text,
        };
      })
      .filter((item) => item.text.toLowerCase().includes(normalizedQuery))
      .slice(0, 24)
      .map(({ element, text }) => ({
        id: element.id,
        label: text.split("\n").find(Boolean)?.slice(0, 80) || element.type,
        meta: `${element.type} · ${element.id}`,
      }));
  },

  focusElement(elementId: string) {
    const element = sceneStore
      .get()
      .elements.find((item) => item.id === elementId);
    if (!element) return false;
    const bounds = getElementBounds(element);
    selectionStore.setElementIds([element.id]);
    viewportStore.set({
      x:
        bounds.x +
        bounds.width / 2 -
        window.innerWidth / 2 / viewportStore.get().zoom,
      y:
        bounds.y +
        bounds.height / 2 -
        window.innerHeight / 2 / viewportStore.get().zoom,
      zoom: viewportStore.get().zoom,
    });
    return true;
  },

  autoLayoutSelection(mode: "flow" | "grid" | "tree" = "flow") {
    const elements = getSelectedElements().filter(
      (element) =>
        !element.locked && element.type !== "arrow" && element.type !== "line",
    );
    if (elements.length < 2) return false;
    const bounds = getElementsBounds(elements);
    if (!bounds) return false;
    const columns =
      mode === "grid"
        ? Math.ceil(Math.sqrt(elements.length))
        : mode === "tree"
          ? 2
          : elements.length;
    const sorted = [...elements].sort(
      (left, right) => getElementBounds(left).x - getElementBounds(right).x,
    );
    const targetById = new Map<string, { x: number; y: number }>();

    sorted.forEach((element, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      targetById.set(element.id, {
        x: bounds.x + column * 230,
        y: bounds.y + row * 140 + (mode === "tree" && column === 1 ? 44 : 0),
      });
    });

    historyStore.begin();
    sceneStore.updateAll((element) => {
      const target = targetById.get(element.id);
      return target ? updateElement(element, target) : element;
    });
    historyStore.commit();
    return true;
  },

  getFrames() {
    return sceneStore
      .get()
      .elements.filter((element) => element.type === "frame")
      .map((element) => ({
        id: element.id,
        name: element.name,
      }));
  },

  exportDrawToolFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const payload = {
      format: DRAWTOOL_FILE_FORMAT,
      version: 1,
      savedAt: new Date().toISOString(),
      scene: serializeScene(sceneStore.get().elements),
      snapshots: readSnapshots(),
    };
    downloadFile(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
      `drawtool-project-${timestamp}.drawtool`,
    );
    return true;
  },

  async importDrawToolFile(file: File) {
    const source = await file.text();
    const parsed = JSON.parse(source) as {
      format?: string;
      scene?: ReturnType<typeof serializeScene>;
      snapshots?: SnapshotItem[];
    };
    const elements =
      parsed.format === DRAWTOOL_FILE_FORMAT && parsed.scene
        ? deserializeScene(JSON.stringify(parsed.scene))
        : deserializeScene(source);

    historyStore.begin();
    sceneStore.setElements(elements);
    selectionStore.clear();
    historyStore.commit();

    if (Array.isArray(parsed.snapshots)) {
      writeSnapshots(parsed.snapshots.slice(0, 12));
    }

    return true;
  },

  runDiagramDiagnostics() {
    const elements = sceneStore.get().elements;
    const emptyLabels = elements.filter(
      (element) =>
        ["arrow", "diamond", "advanced"].includes(element.type) &&
        !element.label &&
        !("title" in element),
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
