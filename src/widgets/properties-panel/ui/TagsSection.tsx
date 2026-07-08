import { Tags } from "lucide-react";
import { updateElement, type BoardElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";

type TagsSectionProps = {
  element: BoardElement;
};

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMetadata(value: string) {
  const metadata = Object.fromEntries(
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return [key.trim(), rest.join(":").trim()];
      })
      .filter(([key, itemValue]) => key && itemValue),
  );

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function stringifyMetadata(metadata: Record<string, string> | undefined) {
  return metadata
    ? Object.entries(metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    : "";
}

function updateElementMeta(
  element: BoardElement,
  patch: Pick<BoardElement, "metadata" | "tags">,
) {
  historyStore.begin();
  sceneStore.updateById(element.id, (current) => updateElement(current, patch));
  historyStore.commit();
}

export function TagsSection({ element }: TagsSectionProps) {
  return (
    <section className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center gap-2 text-sm font-medium text-text">
        <Tags size={16} />
        Tags / metadata
      </div>

      <label className="block space-y-1 text-xs text-text-muted">
        <span>Теги через запятую</span>
        <input
          className="h-9 w-full rounded-md border border-border bg-control px-2 text-sm text-text outline-none transition-colors focus:border-accent"
          onChange={(event) =>
            updateElementMeta(element, {
              metadata: element.metadata,
              tags: parseTags(event.currentTarget.value),
            })
          }
          placeholder="api, todo, backend"
          value={element.tags?.join(", ") ?? ""}
        />
      </label>

      <label className="block space-y-1 text-xs text-text-muted">
        <span>Metadata: key: value</span>
        <textarea
          className="min-h-20 w-full resize-y rounded-md border border-border bg-control px-2 py-2 font-mono text-xs text-text outline-none transition-colors focus:border-accent"
          onChange={(event) =>
            updateElementMeta(element, {
              metadata: parseMetadata(event.currentTarget.value),
              tags: element.tags,
            })
          }
          placeholder={"owner: Ramazan\nstatus: draft"}
          value={stringifyMetadata(element.metadata)}
        />
      </label>
    </section>
  );
}
