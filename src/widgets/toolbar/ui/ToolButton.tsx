import type { ToolbarItem } from "../model/toolItems";

type ToolButtonProps = {
  disabled?: boolean;
  isActive: boolean;
  item: ToolbarItem;
  onClick: () => void;
};

export function ToolButton({
  disabled = false,
  isActive,
  item,
  onClick,
}: ToolButtonProps) {
  const Icon = item.icon;

  return (
    <button
      aria-label={`${item.label}. Клавиши ${item.shortcutHint}`}
      aria-pressed={isActive}
      className={`relative grid size-10 shrink-0 place-items-center rounded-lg transition-colors max-lg:size-11 ${
        isActive
          ? "bg-accent text-white"
          : "text-text hover:bg-control"
      } ${
        disabled
          ? "cursor-not-allowed opacity-40 hover:bg-transparent"
          : ""
      }`}
      disabled={disabled}
      onClick={onClick}
      title={`${item.label} (${item.shortcutHint})`}
      type="button"
    >
      <Icon aria-hidden size={19} strokeWidth={2} />
      <span className="absolute bottom-0.5 right-1 text-[9px] leading-none opacity-70">
        {item.shortcut}
      </span>
    </button>
  );
}
