import { Image as ImageIcon } from "lucide-react";
import {
  updateElement,
  type ImageElement,
  type ImageObjectFit,
  type ImageObjectPosition,
  type ImageShape,
} from "@/entities/element";
import { historyStore } from "@/entities/history";
import { sceneStore } from "@/entities/scene";
import { Button, RangeField, SegmentedControl } from "@/shared/ui";

type ImageSectionProps = {
  element: ImageElement;
};

const SHAPE_ITEMS = [
  { label: "Прямоугольник", value: "rectangle" },
  { label: "Круг", value: "circle" },
] as const;

const FIT_OPTIONS: Array<{ label: string; value: ImageObjectFit }> = [
  { label: "Растянуть", value: "fill" },
  { label: "Вместить", value: "contain" },
  { label: "Обрезать", value: "cover" },
  { label: "Уменьшить", value: "scale-down" },
  { label: "Оригинал", value: "none" },
];

const POSITION_OPTIONS: Array<{ label: string; value: ImageObjectPosition }> = [
  { label: "Центр", value: "center" },
  { label: "Верх", value: "top" },
  { label: "Низ", value: "bottom" },
  { label: "Лево", value: "left" },
  { label: "Право", value: "right" },
];

function updateImage(
  element: ImageElement,
  patch: Partial<
    Pick<
      ImageElement,
      | "cornerRadius"
      | "height"
      | "objectFit"
      | "objectPosition"
      | "shape"
      | "width"
    >
  >,
) {
  historyStore.begin();
  sceneStore.updateById(element.id, (current) =>
    current.type === "image" ? updateElement(current, patch) : current,
  );
  historyStore.commit();
}

export function ImageSection({ element }: ImageSectionProps) {
  const cornerRadius = element.cornerRadius ?? 0;
  const objectFit = element.objectFit ?? "fill";
  const objectPosition = element.objectPosition ?? "center";
  const shape = element.shape ?? "rectangle";
  const maxRadius = Math.round(
    Math.max(0, Math.min(Math.abs(element.width), Math.abs(element.height)) / 2),
  );

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center gap-2 text-sm font-medium text-text">
        <ImageIcon size={16} />
        Изображение
      </div>

      <SegmentedControl<ImageShape>
        items={SHAPE_ITEMS}
        label="Форма"
        onChange={(shape) => updateImage(element, { shape })}
        value={shape}
      />

      {shape === "rectangle" && (
        <RangeField
          label={`Скругление: ${cornerRadius}px`}
          max={Math.max(64, maxRadius)}
          min={0}
          onChange={(cornerRadius) => updateImage(element, { cornerRadius })}
          step={1}
          value={Math.min(cornerRadius, Math.max(64, maxRadius))}
        />
      )}

      <label className="grid gap-1 text-xs font-medium text-text-muted">
        Режим
        <select
          className="h-9 rounded-md border border-border bg-control px-2 text-xs text-text outline-none focus:border-accent"
          onChange={(event) =>
            updateImage(element, {
              objectFit: event.currentTarget.value as ImageObjectFit,
            })
          }
          value={objectFit}
        >
          {FIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs font-medium text-text-muted">
        Позиция
        <select
          className="h-9 rounded-md border border-border bg-control px-2 text-xs text-text outline-none focus:border-accent"
          onChange={(event) =>
            updateImage(element, {
              objectPosition: event.currentTarget.value as ImageObjectPosition,
            })
          }
          value={objectPosition}
        >
          {POSITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="h-9 rounded-md bg-control px-2 text-xs text-text transition-colors hover:bg-surface-muted"
          onClick={() => {
            const size = Math.min(Math.abs(element.width), Math.abs(element.height));
            updateImage(element, { width: size, height: size });
          }}
          type="button"
        >
          1:1
        </Button>

        <Button
          className="h-9 rounded-md bg-control px-2 text-xs text-text transition-colors hover:bg-surface-muted"
          onClick={() =>
            updateImage(element, {
              width: element.originalWidth,
              height: element.originalHeight,
            })
          }
          type="button"
        >
          оригинал
        </Button>
      </div>
    </section>
  );
}
