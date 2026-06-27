import { useMemo, useState, useSyncExternalStore } from "react";
import { Bot, WandSparkles } from "lucide-react";
import {
  createArrow,
  createCodeSketch,
  createRectangle,
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

function makeNodeId(label: string) {
  return label.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-") || "node";
}

function parseDiagramText(source: string) {
  const labels = new Map<string, string>();
  const edges: Edge[] = [];

  source
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const pair = line.split(/\s*(?:-->|->|→)\s*/);
      if (pair.length >= 2) {
        const from = pair[0].trim();
        const to = pair.slice(1).join(" → ").trim();
        const fromId = makeNodeId(from);
        const toId = makeNodeId(to);
        labels.set(fromId, from);
        labels.set(toId, to);
        edges.push({ from: fromId, to: toId });
        return;
      }

      const id = makeNodeId(line);
      labels.set(id, line);
    });

  return { labels, edges };
}

function parseMermaid(source: string) {
  const labels = new Map<string, string>();
  const edges: Edge[] = [];
  const pattern = /([\w-]+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?\s*-+[^>]*>\s*([\w-]+)(?:\[([^\]]+)\]|\(([^)]+)\)|\{([^}]+)\})?/;

  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^graph\s/i.test(line) && !/^flowchart\s/i.test(line))
    .forEach((line) => {
      const match = line.match(pattern);
      if (!match) return;
      const from = match[1];
      const to = match[5];
      labels.set(from, match[2] || match[3] || match[4] || from);
      labels.set(to, match[6] || match[7] || match[8] || to);
      edges.push({ from, to });
    });

  return { labels, edges };
}

function createDiagramElements(labels: Map<string, string>, edges: Edge[]) {
  const viewport = viewportStore.get();
  const originX = viewport.x + 120;
  const originY = viewport.y + 120;
  const entries = [...labels.entries()];
  const positions = new Map<string, { x: number; y: number }>();
  const elements: BoardElement[] = [];

  entries.forEach(([id, label], index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = originX + column * 250;
    const y = originY + row * 150;
    positions.set(id, { x, y });

    elements.push(
      createRectangle({
        x,
        y,
        width: 180,
        height: 76,
        style: {
          strokeColor: "#5b9df6",
          backgroundColor: "#1f3a5f",
          fillStyle: "solid",
          cornerStyle: "rounded",
        },
      }),
      createText({
        x: x + 16,
        y: y + 18,
        text: label,
        fontSize: 18,
        style: { strokeColor: "#f8fafc" },
      }),
    );
  });

  edges.forEach((edge) => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return;
    elements.push(
      createArrow({
        x: from.x + 180,
        y: from.y + 38,
        width: to.x - (from.x + 180),
        height: to.y + 38 - (from.y + 38),
        routing: "elbow",
        style: { strokeColor: "#94a3b8" },
      }),
    );
  });

  return elements;
}

function createCodeSketchElements(source: string): BoardElement[] {
  const viewport = viewportStore.get();
  const x = viewport.x + 160;
  const y = viewport.y + 140;
  const code = source.trim() || "function component() {\n  return <main />;\n}";
  const lines = code.split("\n");
  const width = Math.max(420, Math.min(760, Math.max(...lines.map((line) => line.length)) * 9 + 44));
  const height = Math.max(170, lines.length * 22 + 72);

  return [
    createCodeSketch({
      x,
      y,
      width,
      height,
      title: "Code sketch",
      code,
      language: "tsx",
      style: {
        strokeColor: "#64748b",
        backgroundColor: "#111827",
        fillStyle: "solid",
        cornerStyle: "rounded",
      },
    }),
  ];
}

const DIALOG_COPY = {
  diagram: {
    title: "Текст в диаграмму",
    hint: "Каждая строка вида «Начало → Результат» станет связью между блоками.",
    placeholder: "Идея → Исследование\nИсследование → Прототип\nПрототип → Запуск",
  },
  mermaid: {
    title: "Mermaid в DrawTool",
    hint: "Поддерживаются простые записи graph TD и связи A[Текст] --> B[Текст].",
    placeholder: "graph TD\nA[Клиент] --> B[API]\nB --> C[(База)]",
  },
  code: {
    title: "Каркас для кода",
    hint: "Создаёт редактируемую карточку кода из введённого фрагмента.",
    placeholder: "function App() {\n  return <main>Hello</main>;\n}",
  },
} as const;

export function GenerateDialog() {
  const mode = useSyncExternalStore(generateStore.subscribe, generateStore.get, generateStore.get);
  const copy = mode ? DIALOG_COPY[mode] : null;
  const [source, setSource] = useState("");
  const generated = useMemo(() => (mode ? DIALOG_COPY[mode] : null), [mode]);

  if (!mode || !copy || !generated) return null;

  function close() {
    generateStore.close();
    setSource("");
  }

  function generate() {
    const items =
      mode === "code"
        ? createCodeSketchElements(source)
        : (() => {
            const parsed = mode === "mermaid" ? parseMermaid(source) : parseDiagramText(source);
            return createDiagramElements(parsed.labels, parsed.edges);
          })();

    if (items.length === 0) return;

    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...items]);
    selectionStore.setElementIds(items.map((element) => element.id));
    historyStore.commit();
    close();
  }

  return (
    <Modal isOpen title={copy.title} onClose={close}>
      <div className="space-y-4">
        <p className="m-0 text-sm leading-6 text-text-muted">{copy.hint}</p>
        <textarea
          className="min-h-44 w-full resize-y rounded-lg border border-border bg-control p-3 font-mono text-sm text-text outline-none placeholder:text-text-muted focus:border-accent"
          onChange={(event) => setSource(event.currentTarget.value)}
          placeholder={copy.placeholder}
          value={source}
        />
        <Button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:brightness-110"
          onClick={generate}
          type="button"
        >
          {mode === "code" ? <Bot size={17} /> : <WandSparkles size={17} />}
          Создать на доске
        </Button>
      </div>
    </Modal>
  );
}
