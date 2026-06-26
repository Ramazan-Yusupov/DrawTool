export function CanvasOverlay() {
  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-muted shadow-panel">
      <p className="m-0">R — прямоугольник</p>
      <p className="m-0">V / Escape — выбор</p>
      <p className="m-0">Ctrl + колесо — масштаб</p>
      <p className="m-0">Средняя кнопка — pan</p>
    </aside>
  );
}
