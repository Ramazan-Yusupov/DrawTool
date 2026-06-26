import type { ToolbarItem } from "../model/toolItems";

type ToolButtonProps = {
  isActive: boolean;
  item: ToolbarItem;
  onClick: () => void;
};

export function ToolButton({ isActive, item, onClick }: ToolButtonProps) {
  return (
    <button
      aria-label={`${item.label}. Клавиша ${item.shortcut}`}
      aria-pressed={isActive}
      className={`grid size-10 place-items-center rounded-md text-lg ${
        isActive ? "bg-accent text-white" : "text-text hover:bg-surface-muted"
      }`}
      onClick={onClick}
      title={`${item.label} (${item.shortcut})`}
      type="button"
    >
      {item.icon}
    </button>
  );
}
