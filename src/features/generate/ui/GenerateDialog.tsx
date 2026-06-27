import { useMemo, useState, useSyncExternalStore } from "react";
import { Bot, GitBranch, WandSparkles } from "lucide-react";
import {
  createArrow,
  createCodeSketch,
  createEllipse,
  createRectangle,
  createTable,
  createText,
  type BoardElement,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";
import { viewportStore } from "@/entities/viewport";
import { Button, Modal } from "@/shared/ui";
import { generateStore } from "../model/generateStore";

type Edge = { from: string; to: string };
type DiagramTemplate = "flowchart" | "erd" | "mindmap" | "sequence";

function makeNodeId(label: string) { return label.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-") || "node"; }

function parseDiagramText(source: string) {
  const labels = new Map<string, string>();
  const edges: Edge[] = [];
  source.split(/\r?\n|;/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const pair = line.split(/\s*(?:-->|->|→)\s*/);
    if (pair.length >= 2) {
      const from = pair[0].trim(); const to = pair.slice(1).join(" → ").trim();
      const fromId = makeNodeId(from); const toId = makeNodeId(to);
      labels.set(fromId, from); labels.set(toId, to); edges.push({ from: fromId, to: toId }); return;
    }
    const id = makeNodeId(line); labels.set(id, line);
  });
  return { labels, edges };
}

function parseMermaid(source: string) {
  const labels = new Map<string, string>(); const edges: Edge[] = [];
  const pattern = /([\w-]+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?\s*-+[^>]*>\s*([\w-]+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?/;
  source.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !/^graph\s/i.test(line) && !/^flowchart\s/i.test(line)).forEach((line) => {
    const match = line.match(pattern); if (!match) return;
    const from = match[1]; const to = match[5];
    labels.set(from, match[2] || match[3] || match[4] || from);
    labels.set(to, match[6] || match[7] || match[8] || to);
    edges.push({ from, to });
  });
  return { labels, edges };
}

function createBoundArrow(from: BoardElement, to: BoardElement) {
  return createArrow({
    x: from.x + from.width / 2,
    y: from.y + from.height / 2,
    width: to.x + to.width / 2 - (from.x + from.width / 2),
    height: to.y + to.height / 2 - (from.y + from.height / 2),
    routing: "elbow",
    style: { strokeColor: "#94a3b8" },
  });
}

function bindArrow(arrow: ReturnType<typeof createArrow>, from: BoardElement, to: BoardElement) {
  return { ...arrow, startBinding: { elementId: from.id, focus: 0 }, endBinding: { elementId: to.id, focus: 0 } };
}

function createDiagramElements(labels: Map<string, string>, edges: Edge[]) {
  const viewport = viewportStore.get(); const originX = viewport.x + 120; const originY = viewport.y + 120;
  const entries = [...labels.entries()]; const positions = new Map<string, BoardElement>(); const elements: BoardElement[] = [];
  entries.forEach(([id, label], index) => {
    const column = index % 3; const row = Math.floor(index / 3); const x = originX + column * 250; const y = originY + row * 150;
    const card = createRectangle({ x, y, width: 180, height: 76, style: { strokeColor: "#5b9df6", backgroundColor: "#1f3a5f", fillStyle: "solid", cornerStyle: "rounded" } });
    positions.set(id, card); elements.push(card, createText({ x: x + 16, y: y + 18, text: label, fontSize: 18, style: { strokeColor: "#f8fafc" } }));
  });
  edges.forEach((edge) => { const from = positions.get(edge.from); const to = positions.get(edge.to); if (from && to) elements.push(bindArrow(createBoundArrow(from, to), from, to)); });
  return elements;
}

function createTemplateElements(template: DiagramTemplate): BoardElement[] {
  const viewport = viewportStore.get(); const originX = viewport.x + 120; const originY = viewport.y + 120;
  if (template === "flowchart") {
    const start = createEllipse({ x: originX, y: originY + 80, width: 130, height: 64, style: { backgroundColor: "#14532d", fillStyle: "solid", strokeColor: "#4ade80" } });
    const check = createRectangle({ x: originX + 250, y: originY + 65, width: 180, height: 96, style: { backgroundColor: "#1e3a8a", fillStyle: "solid", strokeColor: "#60a5fa", cornerStyle: "rounded" } });
    const result = createEllipse({ x: originX + 550, y: originY + 80, width: 150, height: 64, style: { backgroundColor: "#7c2d12", fillStyle: "solid", strokeColor: "#fb923c" } });
    return [start, check, result, createText({ x: start.x + 30, y: start.y + 18, text: "Старт", fontSize: 18, style: { strokeColor: "#f8fafc" } }), createText({ x: check.x + 28, y: check.y + 32, text: "Проверка", fontSize: 18, style: { strokeColor: "#f8fafc" } }), createText({ x: result.x + 30, y: result.y + 18, text: "Результат", fontSize: 18, style: { strokeColor: "#f8fafc" } }), bindArrow(createBoundArrow(start, check), start, check), bindArrow(createBoundArrow(check, result), check, result)];
  }
  if (template === "erd") {
    const users = createTable({ x: originX, y: originY, width: 270, height: 170, rows: 4, columns: 2, cells: ["Users", "", "id", "UUID", "name", "Text", "email", "Text"] });
    const orders = createTable({ x: originX + 410, y: originY, width: 270, height: 170, rows: 4, columns: 2, cells: ["Orders", "", "id", "UUID", "user_id", "UUID", "total", "Number"] });
    return [users, orders, bindArrow(createBoundArrow(users, orders), users, orders)];
  }
  if (template === "mindmap") {
    const center = createEllipse({ x: originX + 260, y: originY + 160, width: 180, height: 84, style: { backgroundColor: "#4c1d95", fillStyle: "solid", strokeColor: "#c084fc" } });
    const labels = ["Идеи", "Исследование", "Дизайн", "Запуск"];
    const positions = [[80, 40], [570, 40], [80, 320], [570, 320]] as const;
    const nodes = labels.map((_, index) => createRectangle({ x: originX + positions[index][0], y: originY + positions[index][1], width: 150, height: 58, style: { backgroundColor: "#172554", fillStyle: "solid", strokeColor: "#60a5fa", cornerStyle: "rounded" } }));
    const text = [createText({ x: center.x + 48, y: center.y + 26, text: "Тема", fontSize: 20, style: { strokeColor: "#f8fafc" } }), ...nodes.map((node, index) => createText({ x: node.x + 18, y: node.y + 18, text: labels[index], fontSize: 16, style: { strokeColor: "#f8fafc" } }))];
    return [center, ...nodes, ...text, ...nodes.map((node) => bindArrow(createBoundArrow(center, node), center, node))];
  }
  const client = createRectangle({ x: originX, y: originY, width: 150, height: 64, style: { backgroundColor: "#172554", fillStyle: "solid", strokeColor: "#60a5fa", cornerStyle: "rounded" } });
  const api = createRectangle({ x: originX + 280, y: originY, width: 150, height: 64, style: { backgroundColor: "#172554", fillStyle: "solid", strokeColor: "#60a5fa", cornerStyle: "rounded" } });
  const db = createRectangle({ x: originX + 560, y: originY, width: 150, height: 64, style: { backgroundColor: "#172554", fillStyle: "solid", strokeColor: "#60a5fa", cornerStyle: "rounded" } });
  const lines = [client, api, db].flatMap((node) => [createText({ x: node.x + 32, y: node.y + 20, text: node === client ? "Клиент" : node === api ? "API" : "База", fontSize: 18, style: { strokeColor: "#f8fafc" } }), createArrow({ x: node.x + 75, y: node.y + 64, width: 0, height: 230, routing: "straight", style: { strokeColor: "#64748b", strokeStyle: "dashed" } })]);
  const request = bindArrow(createBoundArrow(client, api), client, api); const query = bindArrow(createBoundArrow(api, db), api, db);
  return [client, api, db, ...lines, request, query];
}

function createCodeSketchElements(source: string): BoardElement[] {
  const viewport = viewportStore.get(); const x = viewport.x + 160; const y = viewport.y + 140;
  const code = source.trim() || "function component() {\n  return <main />;\n}"; const lines = code.split("\n");
  const width = Math.max(420, Math.min(760, Math.max(...lines.map((line) => line.length)) * 9 + 44)); const height = Math.max(170, lines.length * 22 + 72);
  return [createCodeSketch({ x, y, width, height, title: "Code sketch", code, language: "tsx", style: { strokeColor: "#64748b", backgroundColor: "#111827", fillStyle: "solid", cornerStyle: "rounded" } })];
}

const DIALOG_COPY = {
  diagram: { title: "Текст в диаграмму", hint: "Каждая строка вида «Начало → Результат» станет связью между блоками.", placeholder: "Идея → Исследование\nИсследование → Прототип\nПрототип → Запуск" },
  mermaid: { title: "Mermaid в DrawTool", hint: "Поддерживаются простые записи graph TD и связи A[Текст] --> B[Текст].", placeholder: "graph TD\nA[Клиент] --> B[API]\nB --> C[(База)]" },
  code: { title: "Каркас для кода", hint: "Создаёт редактируемую карточку кода из введённого фрагмента.", placeholder: "function App() {\n  return <main>Hello</main>;\n}" },
  templates: { title: "Шаблоны диаграмм", hint: "Готовые flowchart, ERD, mind map и sequence diagram создаются настоящими элементами доски: их можно менять, связывать и экспортировать.", placeholder: "" },
} as const;

export function GenerateDialog() {
  const mode = useSyncExternalStore(generateStore.subscribe, generateStore.get, generateStore.get);
  const copy = mode ? DIALOG_COPY[mode] : null;
  const [source, setSource] = useState("");
  const [template, setTemplate] = useState<DiagramTemplate>("flowchart");
  const generated = useMemo(() => (mode ? DIALOG_COPY[mode] : null), [mode]);
  if (!mode || !copy || !generated) return null;

  function close() { generateStore.close(); setSource(""); }
  function generate() {
    const items = mode === "code" ? createCodeSketchElements(source) : mode === "templates" ? createTemplateElements(template) : (() => { const parsed = mode === "mermaid" ? parseMermaid(source) : parseDiagramText(source); return createDiagramElements(parsed.labels, parsed.edges); })();
    if (items.length === 0) return;
    historyStore.begin(); sceneStore.setElements([...sceneStore.get().elements, ...items]); selectionStore.setElementIds(items.map((element) => element.id)); historyStore.commit(); close();
  }

  return <Modal isOpen title={copy.title} onClose={close}><div className="space-y-4"><p className="m-0 text-sm leading-6 text-text-muted">{copy.hint}</p>{mode === "templates" ? <div className="grid gap-2">{(["flowchart", "erd", "mindmap", "sequence"] as DiagramTemplate[]).map((value) => <Button className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left text-sm ${template === value ? "border-accent bg-accent/15 text-text" : "border-border bg-control text-text hover:bg-surface-muted"}`} key={value} onClick={() => setTemplate(value)} type="button"><span>{value === "flowchart" ? "Flowchart" : value === "erd" ? "ERD" : value === "mindmap" ? "Mind map" : "Sequence diagram"}</span><GitBranch size={16} /></Button>)}</div> : <textarea className="min-h-44 w-full resize-y rounded-lg border border-border bg-control p-3 font-mono text-sm text-text outline-none placeholder:text-text-muted focus:border-accent" onChange={(event) => setSource(event.currentTarget.value)} placeholder={copy.placeholder} value={source} />}<Button className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:brightness-110" onClick={generate} type="button">{mode === "code" ? <Bot size={17} /> : <WandSparkles size={17} />}{mode === "templates" ? "Добавить шаблон" : "Создать на доске"}</Button></div></Modal>;
}
