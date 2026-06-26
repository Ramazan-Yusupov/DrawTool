import type { ColorOption } from "@/features/change-style/model/styleOptions";

type ColorPaletteProps = {
  label: string;
  options: readonly ColorOption[];
  value: string;
  onChange: (value: string) => void;
};

export function ColorPalette({
  label,
  options,
  value,
  onChange,
}: ColorPaletteProps) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-sm text-text-muted">{label}</legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              aria-label={option.label}
              aria-pressed={isActive}
              className={`size-7 rounded-md border border-border ${
                isActive ? "ring-2 ring-accent ring-offset-2" : ""
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              style={
                option.value === "transparent"
                  ? {
                      backgroundImage:
                        "linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%)",
                      backgroundSize: "8px 8px",
                    }
                  : { backgroundColor: option.value }
              }
              type="button"
            />
          );
        })}
      </div>
    </fieldset>
  );
}
