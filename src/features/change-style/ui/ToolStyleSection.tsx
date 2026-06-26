import type { ElementStyle, StrokeStyle } from "@/entities/element";
import { ColorPalette, RangeField, SegmentedControl } from "@/shared/ui";
import type { ToolStyleCapabilities } from "../model/toolCapabilities";
import { FILL_COLORS, STROKE_COLORS } from "../model/styleOptions";

type ToolStyleSectionProps = {
  style: ElementStyle;
  capabilities: ToolStyleCapabilities;
  onChange: (patch: Partial<ElementStyle>) => void;
};

const STROKE_WIDTHS = [
  { label: "1px", value: "1" },
  { label: "2px", value: "2" },
  { label: "4px", value: "4" },
] as const;

const STROKE_STYLES = [
  { label: "Сплошная", value: "solid" },
  { label: "Штрих", value: "dashed" },
  { label: "Точки", value: "dotted" },
] as const;

const CORNER_STYLES = [
  { label: "Острые", value: "sharp" },
  { label: "Скруглённые", value: "rounded" },
] as const;

export function ToolStyleSection({
  style,
  capabilities,
  onChange,
}: ToolStyleSectionProps) {
  return (
    <div className="space-y-5">
      {capabilities.stroke && (
        <section className="space-y-3">
          <ColorPalette
            label="Цвет контура"
            onChange={(strokeColor) => onChange({ strokeColor })}
            options={STROKE_COLORS}
            value={style.strokeColor}
          />

          <SegmentedControl
            items={STROKE_WIDTHS}
            label="Толщина"
            onChange={(value) => onChange({ strokeWidth: Number(value) })}
            value={String(style.strokeWidth) as "1" | "2" | "4"}
          />

          <SegmentedControl<StrokeStyle>
            items={STROKE_STYLES}
            label="Стиль линии"
            onChange={(strokeStyle) => onChange({ strokeStyle })}
            value={style.strokeStyle}
          />
        </section>
      )}

      {capabilities.fill && (
        <section className="space-y-3 border-t border-border pt-5">
          <ColorPalette
            label="Заливка"
            onChange={(backgroundColor) => {
              onChange({
                backgroundColor,
                fillStyle:
                  backgroundColor === "transparent" ? "transparent" : "solid",
              });
            }}
            options={FILL_COLORS}
            value={style.backgroundColor}
          />
        </section>
      )}

      {capabilities.corner && (
        <section className="border-t border-border pt-5">
          <SegmentedControl
            items={CORNER_STYLES}
            label="Углы"
            onChange={(cornerStyle) => onChange({ cornerStyle })}
            value={style.cornerStyle}
          />
        </section>
      )}

      {capabilities.opacity && (
        <section className="border-t border-border pt-5">
          <RangeField
            label={`Прозрачность: ${Math.round(style.opacity * 100)}%`}
            max={100}
            min={10}
            onChange={(value) => onChange({ opacity: value / 100 })}
            step={5}
            value={Math.round(style.opacity * 100)}
          />
        </section>
      )}
    </div>
  );
}
