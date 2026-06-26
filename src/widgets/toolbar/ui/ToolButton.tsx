import type { ToolbarItem } from "../model/toolItems";

type ToolButtonProps = {
  isActive: boolean;
  item: ToolbarItem;
  onClick: () => void;
};

export function ToolButton({ isActive, item, onClick }: ToolButtonProps) {
  const Icon = item.icon;

  return (
    <button
      aria-label={`${item.label}. Клавиша ${item.shortcut}`}
      aria-pressed={isActive}
      className={`relative grid size-10 place-items-center rounded-lg transition-colors ${
        isActive
          ? "bg-accent text-white"
          : "text-text hover:bg-control"
      }`}
      onClick={onClick}
      title={`${item.label} (${item.shortcut})`}
      type="button"
    >
      <Icon aria-hidden size={19} strokeWidth={2} />
      <span className="absolute bottom-0.5 right-1 text-[9px] leading-none opacity-70">
        {item.shortcut}
      </span>
    </button>
  );
}
