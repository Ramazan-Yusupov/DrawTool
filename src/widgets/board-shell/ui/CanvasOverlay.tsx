export function CanvasOverlay() {
  return (
    <aside
      className="pointer-events-none absolute bottom-4 left-4 rounded-md px-3 py-2 text-xs shadow-sm"
      style={{
        color: "var(--color-text-muted)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p className="m-0">Колесо — перемещение</p>
      <p className="m-0">Ctrl + колесо — масштаб</p>
      <p className="m-0">Средняя кнопка — pan</p>
    </aside>
  );
}
