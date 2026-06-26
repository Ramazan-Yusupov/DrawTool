import { Palette } from "lucide-react";
import type { ColorOption } from "@/shared/types";

type ColorPaletteProps = {
  label: string;
  options: readonly ColorOption[];
  value: string;
  onChange: (value: string) => void;
  /** Adds a native color picker for arbitrary border/fill colors. */
  allowCustom?: boolean;
};

function isColorValue(value: string) {
  return /^#[0-9a-f]{3,8}$/i.test(value) || /^rgb\(/i.test(value) || /^hsl\(/i.test(value);
}

export function ColorPalette({
  label,
  options,
  value,
  onChange,
  allowCustom = true,
}: ColorPaletteProps) {
  const currentCustomValue = isColorValue(value) ? value : "#000000";

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-xs font-medium text-text-muted">{label}</legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              aria-label={option.label}
              aria-pressed={isActive}
              className={`size-6 rounded-md border transition-transform hover:scale-105 ${
                isActive
                  ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-panel"
                  : "border-border"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              style={
                option.value === "transparent"
                  ? {
                      backgroundImage:
                        "linear-gradient(45deg, #64748b 25%, transparent 25%, transparent 75%, #64748b 75%)",
                      backgroundSize: "8px 8px",
                    }
                  : { backgroundColor: option.value }
              }
              type="button"
            />
          );
        })}

        {allowCustom && (
          <label
            className="relative grid size-6 cursor-pointer place-items-center overflow-hidden rounded-md border border-border bg-control text-text-muted transition-transform hover:scale-105 hover:text-text"
            title={`Выбрать свой цвет: ${label.toLowerCase()}`}
          >
            <Palette aria-hidden size={14} />
            <input
              aria-label={`Открыть палитру: ${label.toLowerCase()}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(event) => onChange(event.currentTarget.value)}
              type="color"
              value={currentCustomValue}
            />
          </label>
        )}
      </div>
    </fieldset>
  );
}
