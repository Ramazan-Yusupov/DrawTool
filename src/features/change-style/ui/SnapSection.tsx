type SnapSectionProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SnapSection({ checked, onChange }: SnapSectionProps) {
  return (
    <section className="border-t border-border pt-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={checked}
          className="mt-1 size-4 accent-accent"
          onChange={(event) => onChange(event.currentTarget.checked)}
          type="checkbox"
        />

        <span>
          <strong className="block text-sm text-text">
            Привязка к пересечениям сетки
          </strong>

          <span className="block text-xs text-text-muted">
            Новые фигуры привязываются к шагу 10px.
          </span>
        </span>
      </label>
    </section>
  );
}
