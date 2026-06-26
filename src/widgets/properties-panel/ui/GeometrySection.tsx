import type { BoardElement } from "@/entities/element";
import { NumberField } from "@/shared/ui";

type GeometrySectionProps = {
  element: BoardElement;
  onChange: (patch: Pick<BoardElement, "x" | "y" | "width" | "height">) => void;
};

export function GeometrySection({ element, onChange }: GeometrySectionProps) {
  if (element.type === "line" || element.type === "arrow") {
    return (
      <section className="space-y-3 border-t border-border pt-4">
        <p className="m-0 text-sm font-medium text-text">Положение и длина</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="X"
            max={100000}
            min={-100000}
            onChange={(x) => onChange({ x, y: element.y, width: element.width, height: element.height })}
            step={1}
            value={Math.round(element.x)}
          />
          <NumberField
            label="Y"
            max={100000}
            min={-100000}
            onChange={(y) => onChange({ x: element.x, y, width: element.width, height: element.height })}
            step={1}
            value={Math.round(element.y)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <p className="m-0 text-sm font-medium text-text">Размер и позиция</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="X"
          max={100000}
          min={-100000}
          onChange={(x) => onChange({ x, y: element.y, width: element.width, height: element.height })}
          step={1}
          value={Math.round(element.x)}
        />
        <NumberField
          label="Y"
          max={100000}
          min={-100000}
          onChange={(y) => onChange({ x: element.x, y, width: element.width, height: element.height })}
          step={1}
          value={Math.round(element.y)}
        />
        <NumberField
          label="Ширина"
          max={100000}
          min={1}
          onChange={(width) => onChange({ x: element.x, y: element.y, width, height: element.height })}
          step={1}
          value={Math.round(element.width)}
        />
        <NumberField
          label="Высота"
          max={100000}
          min={1}
          onChange={(height) => onChange({ x: element.x, y: element.y, width: element.width, height })}
          step={1}
          value={Math.round(element.height)}
        />
      </div>
    </section>
  );
}
