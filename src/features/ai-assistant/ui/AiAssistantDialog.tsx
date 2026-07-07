import { useState } from "react";
import { aiAssistant } from "@/features/ai-assistant/model/aiAssistant";
import { Button, Modal } from "@/shared/ui";

type AiAssistantDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AiAssistantDialog({ isOpen, onClose }: AiAssistantDialogProps) {
  const [apiKey, setApiKey] = useState(aiAssistant.getApiKey());
  const [model, setModel] = useState(aiAssistant.getModel());
  const [prompt, setPrompt] = useState("Создай диаграмму процесса регистрации пользователя");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setIsLoading(true);
    setResult("");
    aiAssistant.setApiKey(apiKey);
    aiAssistant.setModel(model);
    try {
      const value = await action();
      setResult(typeof value === "string" ? value : "Готово");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Studio">
      <div className="space-y-3 text-sm">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-text-muted">OpenAI API key</span>
          <input
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-text outline-none focus:border-accent"
            onChange={(event) => setApiKey(event.currentTarget.value)}
            placeholder="sk-..."
            type="password"
            value={apiKey}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold text-text-muted">Model</span>
          <input
            className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-text outline-none focus:border-accent"
            onChange={(event) => setModel(event.currentTarget.value)}
            value={model}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold text-text-muted">Prompt</span>
          <textarea
            className="min-h-24 w-full resize-y rounded-lg border border-border bg-surface-muted px-3 py-2 text-text outline-none focus:border-accent"
            onChange={(event) => setPrompt(event.currentTarget.value)}
            value={prompt}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <Button className="rounded-lg bg-accent px-3 py-2 text-white" disabled={isLoading} onClick={() => run(() => aiAssistant.generateDiagram(prompt))}>
            Generate diagram
          </Button>
          <Button className="rounded-lg bg-control px-3 py-2 text-text" disabled={isLoading} onClick={() => run(() => Promise.resolve(aiAssistant.applySimpleCleanup() ? "Layout cleaned" : "Scene is empty"))}>
            AI cleanup
          </Button>
          <Button className="rounded-lg bg-control px-3 py-2 text-text" disabled={isLoading} onClick={() => run(() => aiAssistant.explainDiagram())}>
            Explain
          </Button>
          <Button className="rounded-lg bg-control px-3 py-2 text-text" disabled={isLoading} onClick={() => run(() => aiAssistant.convertDiagram("mermaid"))}>
            To Mermaid
          </Button>
        </div>

        {result && (
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-canvas p-3 text-xs text-text">
            {result}
          </pre>
        )}
      </div>
    </Modal>
  );
}
