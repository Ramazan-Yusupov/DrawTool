import type { AdvancedElement } from "@/entities/element";
import { updateElement } from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { Button } from "@/shared/ui";

type PremiumSectionProps = {
  element: AdvancedElement;
};

const STATUS_PRESETS = [
  ["Draft"],
  ["In review"],
  ["Done"],
  ["Blocked"],
  ["В разработке"],
  ["Завершен"],
  ["План", "В разработке", "Завершен"],
  ["Draft", "In review", "Done"],
  ["Backlog", "Doing", "Done"],
] as const;

const TEMPLATE_PRESETS: Partial<Record<AdvancedElement["kind"], string[]>> = {
  "status-badge": ["Draft", "In review", "Done"],
  "flow-step": ["Process step", "Outcome"],
  "annotation-pin": ["Review this area"],
  "api-endpoint": ["Request", "Response", "Auth"],
  "database-cylinder": ["users", "orders", "events"],
  "org-card": ["Role", "Owner", "Contact"],
};

function updateAdvancedElement(
  elementId: string,
  patch: Partial<Pick<AdvancedElement, "body" | "title">>,
) {
  historyStore.begin();
  sceneStore.updateById(elementId, (element) =>
    element.type === "code" && "kind" in element
      ? updateElement(element, patch)
      : element,
  );
  historyStore.commit();
}

export function PremiumSection({ element }: PremiumSectionProps) {
  const bodyText = element.body.join("\n");
  const preset = TEMPLATE_PRESETS[element.kind];

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <div>
        <p className="m-0 text-sm font-medium text-text">Premium content</p>
        <p className="m-0 text-xs text-text-muted">
          Заголовок и строки рендерятся с фирменным стилем блока.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-text-muted">Заголовок</span>
        <input
          className="h-9 w-full rounded-md border border-border bg-control px-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          onChange={(event) =>
            updateAdvancedElement(element.id, {
              title: event.currentTarget.value,
            })
          }
          value={element.title}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-text-muted">
          Содержимое
        </span>
        <textarea
          className="min-h-24 w-full resize-y rounded-md border border-border bg-control px-2 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent"
          onChange={(event) =>
            updateAdvancedElement(element.id, {
              body: event.currentTarget.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
          value={bodyText}
        />
      </label>

      {preset && (
        <Button
          className="w-full rounded-md border border-border bg-control px-2 py-2 text-xs text-text transition-colors hover:bg-surface-muted"
          onClick={() => updateAdvancedElement(element.id, { body: preset })}
          type="button"
        >
          Вставить шаблон
        </Button>
      )}

      {element.kind === "status-badge" && (
        <div className="grid grid-cols-2 gap-1.5">
          {STATUS_PRESETS.map((items) => (
            <Button
              className="rounded-md border border-border bg-control px-2 py-2 text-xs text-text transition-colors hover:bg-surface-muted"
              key={items.join("-")}
              onClick={() =>
                updateAdvancedElement(element.id, { body: [...items] })
              }
              type="button"
            >
              {items.join(" / ")}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
