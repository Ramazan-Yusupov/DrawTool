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
      <legend className="mb-2 text-xs font-medium text-text-muted">{label}</legend>

      <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg">
        {items.map((item) => {
          const isActive = item.value === value;

          return (
            <button
              aria-pressed={isActive}
              className={`min-h-9 rounded-md border border-transparent px-2 text-xs transition-colors ${
                isActive
                  ? "bg-control-active font-medium text-white shadow-sm"
                  : "bg-control text-text hover:bg-surface-muted"
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
