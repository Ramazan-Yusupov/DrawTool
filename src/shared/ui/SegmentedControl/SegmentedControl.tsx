type SegmentedItem<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  items: readonly SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  label,
  items,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 text-sm text-text-muted">{label}</legend>

      <div className="grid grid-flow-col auto-cols-fr overflow-hidden rounded-md border border-border">
        {items.map((item) => {
          const isActive = item.value === value;

          return (
            <button
              aria-pressed={isActive}
              className={`min-h-9 px-2 text-xs ${
                isActive
                  ? "bg-accent font-medium text-white"
                  : "bg-surface hover:bg-surface-muted"
              }`}
              key={item.value}
              onClick={() => onChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
