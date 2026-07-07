import { createElement, type BoardElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { selectionStore } from "@/entities/selection";

const API_KEY_STORAGE_KEY = "drawtool.openaiApiKey";
const MODEL_STORAGE_KEY = "drawtool.openaiModel";
const DEFAULT_MODEL = "gpt-4o-mini";

type AiDiagramNode = {
  type?: "rectangle" | "diamond" | "ellipse" | "advanced";
  label: string;
  x?: number;
  y?: number;
};

function getOutputText(value: unknown) {
  const response = value as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter(Boolean)
    .join("\n") ?? "";
}

function sceneSummary() {
  return sceneStore.get().elements.map((element) => ({
    id: element.id,
    type: element.type,
    label: element.label,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  }));
}

export const aiAssistant = {
  getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
  },

  setApiKey(apiKey: string) {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  },

  getModel() {
    return localStorage.getItem(MODEL_STORAGE_KEY) ?? DEFAULT_MODEL;
  },

  setModel(model: string) {
    localStorage.setItem(MODEL_STORAGE_KEY, model.trim() || DEFAULT_MODEL);
  },

  async ask(prompt: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Добавьте OpenAI API key.");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.getModel(),
        instructions:
          "You are a diagram assistant for DrawTool. Return concise, structured output. For diagram generation return only JSON array of nodes with label, type, x, y.",
        input: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return getOutputText(await response.json());
  },

  async generateDiagram(prompt: string) {
    const text = await this.ask(
      `Create a compact diagram for: ${prompt}. Return JSON array only. Node type must be rectangle, diamond, ellipse, or advanced.`,
    );
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    const source = jsonStart >= 0 && jsonEnd >= jsonStart
      ? text.slice(jsonStart, jsonEnd + 1)
      : text;
    const nodes = JSON.parse(source) as AiDiagramNode[];
    const elements = nodes.slice(0, 16).map((node, index) => {
      const type = node.type ?? "rectangle";
      return {
        ...createElement(type, {
          x: node.x ?? 80 + (index % 4) * 230,
          y: node.y ?? 80 + Math.floor(index / 4) * 150,
          width: type === "advanced" ? 220 : 180,
          height: type === "advanced" ? 120 : 90,
          kind: "mindmap-node",
        }),
        label: node.label,
      };
    });

    historyStore.begin();
    sceneStore.setElements([...sceneStore.get().elements, ...elements]);
    selectionStore.setElementIds(elements.map((element) => element.id));
    historyStore.commit();
    return elements;
  },

  async cleanupSuggestion() {
    return this.ask(
      `Suggest a better layout for this scene. Return short bullet points:\n${JSON.stringify(sceneSummary())}`,
    );
  },

  async explainDiagram() {
    return this.ask(
      `Explain this diagram in Russian in 5 concise bullets:\n${JSON.stringify(sceneSummary())}`,
    );
  },

  async convertDiagram(format: "mermaid" | "markdown") {
    return this.ask(
      `Convert this DrawTool scene to ${format}. Return only ${format}:\n${JSON.stringify(sceneSummary())}`,
    );
  },

  applySimpleCleanup() {
    const elements = sceneStore.get().elements;
    if (elements.length === 0) return false;
    historyStore.begin();
    sceneStore.setElements(
      elements.map((element, index): BoardElement => ({
        ...element,
        x: 80 + (index % 4) * 240,
        y: 80 + Math.floor(index / 4) * 160,
        updatedAt: Date.now(),
      })),
    );
    historyStore.commit();
    return true;
  },
};
