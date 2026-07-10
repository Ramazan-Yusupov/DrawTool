**DrawTool** — интерактивная бесконечная доска для схем, заметок, диаграмм и свободного рисования.  
Проект самостоятельно реализует привычные сценарии редакторов наподобие Excalidraw и Figma: создание фигур, редактирование текста, перемещение, поворот, выравнивание, работа со слоями и сохранение сцены.

## Возможности

- Бесконечный холст с панорамированием и масштабированием.
- Тёмная и светлая темы, тёмная включена по умолчанию.
- Точечный фон вместо обычной сетки.
- Создание и редактирование:
  - прямоугольников;
  - эллипсов;
  - ромбов;
  - линий и стрелок;
  - текста;
  - свободного рисования;
  - дополнительных фигур: треугольник, шестиугольник, звезда и облако;
  - фреймов;
  - Code Sketch;
  - встроенных страниц.
- Настройка обводки, заливки, прозрачности, толщины и стиля линий.
- Готовые свотчи и системный color picker для произвольных цветов.
- Выделение, перемещение, изменение размера и свободный поворот объектов.
- Круглая ручка для поворота объектов.
- Текст всегда отрисовывается поверх фигур.
- Изменение размеров текста с корректным масштабированием содержимого.
- Поддержка слоёв, дублирования и удаления объектов.
- Ластик для удаления объектов кликом или проведением.
- Undo / Redo.
- Привязка к сеточному шагу при изменении размеров.
- Выравнивание объектов при перемещении:
  - `Shift` фиксирует движение по горизонтальной или вертикальной оси;
  - `Ctrl` / `Cmd` включает smart alignment;
  - короткие красные направляющие показывают выравнивание по краям и центрам.
- Frame работает как контейнер: дочерние элементы перемещаются и масштабируются вместе с ним.
- Code Sketch сохраняет заголовок и содержимое внутри карточки при изменении размера.
- Автосохранение сцены в `localStorage`.
- Экспорт сцены в JSON и импорт JSON-файла.
- Адаптивный интерфейс для desktop, планшетов и мобильных устройств.

## План улучшений инструментов

Этот список нужен, чтобы улучшать инструменты последовательно и не терять мелкие хвосты после новых функций.

### Core tools

- `Selection` — selection, resize, rotate, group/ungroup, align/distribute, lock/unlock, context menu applicability.
- `Pan` — плавность перемещения холста, Space-hold режим, mobile/touch поведение.
- `Rectangle` — label, fill/stroke/corner, resize rotated handles, export parity.
- `Diamond` — label, hit-test по форме, resize rotated handles, connector anchors.
- `Ellipse` — label, hit-test по форме, connector anchors, export parity.
- `Arrow` — routing, waypoints, магнит к границе фигур, label along path, SVG parity.
- `Line` — label along line, vertical label rotation, endpoint handles, SVG parity.
- `Freedraw` — толщина, цвет, сглаживание, hit-test path, export parity.
- `Text` — стабильный editor overlay, font size, align, color, no line-only controls.
- `Eraser` — удаление drag/click, locked protection, undo batching.

### More tools

- `Frame` — children, auto-attach, resize children, export frame, click priority for children.
- `Embed` — title/url editing, preview card, link open behavior.
- `Image` — crop/object-fit, circle/rounded shape, original size, export/import persistence.
- `Sticky` — editable text, font size, fill/stroke/corner, frame behavior.
- `Callout` — editable text, font size, target binding, connector sync.
- `Table` — rows/columns/cells, font size, resize/export/import parity.
- `Markdown` — title/content/font size, markdown rendering, export parity.
- `Measure` — readonly measurement label, endpoint handles, no unrelated text controls.
- `Highlighter` — marker thickness/color/opacity, smooth path, no fill-only noise.
- `Code` — title/code/language editing, monospace preview, export parity.
- `Triangle`, `Hexagon`, `Badge`, `Star`, `Cloud` — label/style/resize/hit-test/export parity.
- `Eyedropper` — style pick source, copied-style preview, apply-style availability.
- `Laser` — transient pointer path, no scene persistence, clear on escape/tool switch.
- `Lasso` — freeform selection, additive selection, locked/group behavior.

### Premium shapes

- `Swimlane`, `BPMN task/event/gateway`, `UML class/actor`, `ERD table/relation`, `Kanban board`, `Timeline`, `Mind map`, `Cloud service`, `Wireframe`, `Smart connector`, `Section/Zone`, `Flow step`, `Status badge`, `Annotation pin`, `Template stamp`, `API endpoint`, `Database`, `Org card`.
- Для каждого premium shape: редактируемый `title`, структурированный `body`, отсутствие лишнего `label`, правильные context-menu actions, export/import parity.

## Технологии

- React
- TypeScript
- Canvas API
- Tailwind CSS
- Lucide React

## Запуск

Установите зависимости:

```bash
npm install
```
