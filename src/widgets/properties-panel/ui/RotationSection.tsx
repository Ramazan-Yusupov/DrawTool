import { RotateCcw, RotateCw } from "lucide-react";
import { NumberField } from "@/shared/ui";

type RotationSectionProps = {
  angle: number;
  onChange: (angle: number) => void;
};

export function RotationSection({ angle, onChange }: RotationSectionProps) {
  const degrees = Math.round((angle * 180) / Math.PI * 10) / 10;

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <p className="m-0 text-sm font-medium text-text">Поворот</p>
      <div className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
        <NumberField
          label="Угол"
          max={100000}
          min={-100000}
          onChange={(value) => onChange((value * Math.PI) / 180)}
          step={1}
          suffix="°"
          value={degrees}
        />
        <button
          aria-label="Повернуть на 90 градусов против часовой стрелки"
          className="grid size-10 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
          onClick={() => onChange(angle - Math.PI / 2)}
          title="−90°"
          type="button"
        >
          <RotateCcw size={17} />
        </button>
        <button
          aria-label="Повернуть на 90 градусов по часовой стрелке"
          className="grid size-10 place-items-center rounded-md bg-control text-text hover:bg-surface-muted"
          onClick={() => onChange(angle + Math.PI / 2)}
          title="+90°"
          type="button"
        >
          <RotateCw size={17} />
        </button>
      </div>
      <p className="m-0 text-xs text-text-muted">Тяните кружок над фигурой для свободного поворота.</p>
    </section>
  );
}
