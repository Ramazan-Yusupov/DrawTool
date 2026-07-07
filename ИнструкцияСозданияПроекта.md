# MASTER_RULES_REACT_NEXT.md

> Версия: 1.0  
> Назначение: универсальная инструкция для ИИ-разработчика и команды при создании или развитии любого проекта на React + TypeScript или Next.js + TypeScript.  
> Использование: положить в корень проекта как `AGENTS.md` или `CLAUDE.md`. Специфичные правила продукта хранить отдельно в `docs/PROJECT_RULES.md`.

---

# 1. Роль и рабочий порядок

Ты разрабатываешь production-ready React / Next.js приложение. Твоя задача — не только написать работающий код, но и сохранить архитектуру, читаемость, доступность, производительность и возможность безопасного развития проекта.

Всегда работай в следующем порядке:

1. Изучи существующую структуру, `package.json`, конфигурацию, текущие правила проекта и связанные модули.
2. Найди существующие actions, hooks, stores, UI primitives и типы, которые можно переиспользовать.
3. Определи минимально необходимое изменение.
4. Сначала сохрани существующее поведение и UI, затем устрани дублирование, затем добавь новую функцию.
5. Не создавай абстракции, файлы и зависимости «на будущее».
6. После реализации запусти проверки и честно сообщи результат.

Главный принцип:

> Один пользовательский сценарий — одна feature.  
> Одна доменная операция — один источник истины.  
> Одна повторяющаяся UI-основа — один shared primitive.

---

# 2. Выбор React или Next.js

## Используй Next.js, когда нужны

- несколько маршрутов;
- SEO;
- SSR или server rendering;
- Server Components;
- server actions;
- API routes / route handlers;
- авторизация;
- доступ к базе данных;
- публикация контента;
- приватные server environment variables.

## Используй React + Vite, когда

- приложение полностью клиентское;
- SEO и SSR не нужны;
- это локальный редактор, внутренний dashboard или desktop-like инструмент;
- сервер существует отдельно или не нужен.

Не добавляй Next.js в проект только ради моды. Не добавляй Redux, React Query, Zustand, form library или UI-kit без конкретной причины.

---

# 3. Базовый технологический стандарт

По умолчанию используй:

- React;
- TypeScript с `strict: true`;
- Tailwind CSS;
- Lucide React для иконок;
- ESLint;
- алиас `@/`;
- единый helper `cn()` для условных class names;
- runtime validation для внешних данных;
- доступные семантические HTML-элементы.

Минимальные команды должны существовать:

```bash
npm run typecheck
npm run lint
npm run build
```

Не утверждай, что проект полностью работает, если эти проверки не запускались или завершились ошибкой.

---

# 4. Архитектура по масштабу

## Маленький проект

Для лендинга, MVP или одной независимой страницы допустима компактная структура:

```text
src/
  app/ or pages/
  components/
  features/
  lib/
  shared/
```

## Средний и крупный проект

Используй FSD-подобную структуру:

```text
src/
  app/                 # bootstrap, providers, layouts, global styles
  pages/               # route-level composition, если не используется App Router
  widgets/             # крупные составные UI-блоки
  features/            # действия и пользовательские сценарии
  entities/            # доменная модель и сущности
  shared/
    api/               # HTTP, transport, API helpers
    config/            # constants, environment, feature flags
    lib/               # pure helpers
    types/             # общие типы
    ui/                # универсальные UI primitives
```

Для Next.js App Router допустимо:

```text
src/
  app/
    (marketing)/
    (dashboard)/
    api/
  widgets/
  features/
  entities/
  shared/
```

## Направление импортов

Разрешено импортировать только вниз:

```text
app/pages → widgets → features → entities → shared
```

Запрещено:

- импортировать `widgets` внутри `features`;
- импортировать UI одной feature напрямую из другой feature;
- размещать бизнес-логику продукта в `shared`;
- использовать `shared/lib` как склад случайных функций;
- делать deep import во внутренности другого модуля.

---

# 5. Границы ответственности

## `app` и route-level код

Содержит:

- layouts;
- providers;
- global styles;
- route composition;
- metadata;
- page-level data loading;
- root error/loading/not-found boundaries.

Не содержит большую бизнес-логику, сложные мутации и повторяющийся UI.

## `widgets`

Содержит крупные составные части интерфейса:

- Header;
- Sidebar;
- Dashboard;
- ProjectSidebar;
- CheckoutSummary;
- EditorShell.

Widget собирает feature и entity, но не реализует их бизнес-логику заново.

## `features`

Содержит один конкретный пользовательский сценарий:

- вход;
- создание проекта;
- фильтрация;
- загрузка файла;
- экспорт;
- удаление;
- checkout;
- переключение темы.

Пример:

```text
features/create-project/
  model/
  ui/
  api/
  lib/
  index.ts
```

## `entities`

Содержит доменные понятия:

- User;
- Project;
- Product;
- Order;
- Invoice;
- Site;
- Page;
- Block.

Здесь находятся доменные типы, pure helpers, selectors, схемы и entity-level UI.

## `shared`

Содержит универсальные части без привязки к предметной области:

- Button;
- Modal;
- Input;
- `cn`;
- форматирование даты/денег;
- API client;
- общие constants;
- базовые типы.

---

# 6. Public API и импорты

Каждая feature, entity и shared UI-папка имеет публичный API через `index.ts`.

Пример:

```text
features/delete-project/
  model/deleteProject.ts
  ui/DeleteProjectButton.tsx
  index.ts
```

```ts
export { deleteProject } from "./model/deleteProject";
export { DeleteProjectButton } from "./ui/DeleteProjectButton";
```

Используй:

```ts
import { deleteProject } from "@/features/delete-project";
```

Не используй:

```ts
import { deleteProject } from "@/features/delete-project/model/deleteProject";
```

кроме кода внутри самой feature.

Не создавай пустые `index.ts`, `export {}`, placeholder-файлы или неиспользуемые exports.

---

# 7. Именование

Используй понятные названия.

```text
Компоненты:     PascalCase.tsx
Hooks:          useSomething.ts
Actions:        verbNoun.ts
Pure helpers:   get..., find..., parse..., format..., normalize...
Stores:         somethingStore.ts
Schemas:        somethingSchema.ts
Types:          types.ts или Something.ts
```

Хорошо:

```ts
createInvoice();
deleteSelectedProjects();
updateProfileAvatar();
applyCouponCode();
```

Плохо:

```ts
doThing();
processData();
handleStuff();
makeItWork();
```

`handle...` допустим только для локальных обработчиков событий в компоненте:

```ts
const handleSubmit = () => {};
```

---

# 8. Сокращение кода без ухудшения качества

## Один источник истины

Одна доменная операция реализуется в одном месте.

Пример: `deleteProject(projectId)` должна вызываться из кнопки, меню, горячей клавиши и mobile UI. Нельзя копировать deletion logic в каждом компоненте.

## Когда выносить hook

Выноси hook, когда:

- логика повторяется минимум дважды;
- есть самостоятельный lifecycle / subscription / browser API;
- логике можно дать понятное имя;
- компонент стал перегружен effects и состояниями.

Не выноси hook только ради нескольких строк.

## Когда выносить компонент

Выноси компонент, когда:

- он повторяется;
- имеет независимую ответственность;
- содержит собственное состояние или accessibility-поведение;
- его можно назвать по назначению.

Не создавай компоненты вроде `LeftPart`, `Wrapper`, `SectionTwo`, `BlockInside`.

## Когда не нужна абстракция

Не создавай generic utility после одного применения. Сначала используй понятную конкретную реализацию. Общую abstraction добавляй после реального повторения.

---

# 9. TypeScript

Обязательно:

- `strict: true`;
- не использовать `any`, кроме изолированного interop-кода с обоснованием;
- не использовать `as` для скрытия ошибок типов;
- использовать discriminated unions для сложных состояний;
- валидировать внешние данные на runtime, а не доверять TypeScript.

Пример:

```ts
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Не создавай несколько одинаковых `User`, `UserDto`, `UserResponse`, если между ними нет реального смыслового различия.

---

# 10. React state

Разделяй типы состояния:

| Тип | Где хранить |
|---|---|
| Локальный UI | `useState`, `useReducer` |
| Сложное локальное состояние | `useReducer` |
| URL state | search params / route params |
| Server state | server rendering или cache/query layer |
| Form state | form hook / form library |
| Глобальный UI | небольшой global store |
| Domain state | entity/store, только при необходимости |

Не клади в global store:

- hover;
- локальный input value;
- состояние одной modal;
- временный selected tab одного компонента.

## `useEffect`

Не используй `useEffect` для вычисления производных значений.

Плохо:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Правильно:

```tsx
const fullName = `${firstName} ${lastName}`;
```

`useEffect` нужен только для синхронизации с внешним миром: browser API, subscriptions, timers, DOM integration, external stores.

## Memoization

Не добавляй `useMemo`, `useCallback`, `memo` автоматически. Используй их только после измеренной проблемы или когда нужен стабильный reference для реального consumer.

---

# 11. Next.js: Server и Client boundaries

## Server Components по умолчанию

В App Router оставляй компонент серверным, пока ему не нужны:

- события;
- local state/effects;
- browser API;
- drag-and-drop;
- client store;
- animation runtime на клиенте.

`"use client"` ставь как можно ближе к интерактивному leaf-компоненту. Не делай весь layout или page client component без необходимости.

## Server code

На сервере должны оставаться:

- DB access;
- auth;
- server actions;
- route handlers;
- private API clients;
- secret env;
- webhooks;
- access checks.

Никогда не импортируй server-only модуль в клиентский компонент.

## Mutations

Каждая mutation на сервере должна:

1. валидировать input;
2. проверять пользователя и права;
3. выполнять mutation;
4. возвращать безопасный результат;
5. корректно обновлять cache/revalidation при необходимости.

Не доверяй `userId`, role или permission, пришедшим из браузера.

---

# 12. API, validation и ошибки

Все внешние данные валидируй на границе:

- request body;
- form data;
- URL/search params;
- webhook;
- JSON import;
- upload file;
- ответ внешнего API.

TypeScript не валидирует runtime JSON.

Используй предсказуемый результат API:

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
```

Не показывай пользователю stack trace, raw database errors, секреты и технические детали.

---

# 13. Формы

Каждая форма должна иметь:

- runtime schema;
- field validation;
- submit loading state;
- disabled submit во время отправки;
- field errors;
- общую error message;
- защиту от повторного submit;
- понятный success behavior.

Форма не считается готовой, если работает только при успешном ответе.

---

# 14. Shared UI и стили

В `shared/ui` держи только настоящие reusable primitives:

```text
Button
IconButton
Input
Textarea
Select
Checkbox
Switch
Modal
Popover
Tooltip
DropdownMenu
Tabs
Panel
Divider
EmptyState
ErrorState
Spinner
Skeleton
```

Не клади в shared UI бизнес-компоненты вроде `CheckoutButton`, `ProjectSidebar`, `HeroSettingsPanel`.

Создай и используй единый helper:

```ts
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
```

Используй `cn()` для conditionals, active/disabled state и `className` composition.

Не меняй существующие отступы, размеры, breakpoints и внешний вид UI при рефакторинге без отдельной задачи.

---

# 15. Accessibility

Обязательно:

- `<button>` для действий;
- `<a>` для навигации;
- `aria-label` для icon-only buttons;
- label для input;
- видимый focus;
- keyboard navigation;
- Escape для modal/popover;
- click/tap outside для popover;
- focus trap и return focus для modal;
- не использовать цвет как единственный источник смысла;
- не заменять `<button>` на `<div onClick>`.

---

# 16. Loading, empty и error states

Для каждого экрана с данными предусмотрены:

- loading;
- success;
- empty;
- permission denied;
- network error;
- server error;
- retry.

Не скрывай ошибку пустым экраном. Пользователь должен понимать, что произошло и какое действие доступно.

Для Next.js используй `loading.tsx`, `error.tsx`, `not-found.tsx`, когда это подходит задаче.

---

# 17. Security

Обязательно:

- секреты только в server env;
- runtime validation;
- access control на сервере;
- MIME и size validation для файлов;
- sanitization пользовательского HTML;
- не использовать `dangerouslySetInnerHTML` без sanitizer;
- не писать токены и персональные данные в logs;
- не давать пользователю исполнять произвольный JavaScript без отдельной security-задачи.

---

# 18. Производительность

Сначала измерь проблему, затем оптимизируй.

Используй:

- dynamic import для тяжёлых редакторов, карт, charts, PDF viewer;
- image optimization там, где она поддерживается;
- виртуализацию для больших списков;
- отмену или игнорирование stale requests при поиске и фильтрации;
- selectors, чтобы изменение одного объекта не ререндерило весь интерфейс.

Не оптимизируй наугад и не добавляй memoization без профилирования.

---

# 19. Тестирование

Тестируй обязательно:

- pure helpers;
- validation schemas;
- расчёты;
- преобразования данных;
- access checks;
- критичные actions;
- import/export;
- важные пользовательские потоки.

Приоритет:

1. unit tests — pure logic;
2. integration tests — feature behavior;
3. e2e — login, checkout, создание/изменение важных данных, критичный workflow.

Не трать время на тесты простых static wrappers и Tailwind классов.

---

# 20. Рефакторинг и удаление

Не создавай:

- пустые файлы;
- `export {};`;
- временные заглушки без контракта;
- dead code;
- неиспользуемые exports;
- закомментированный старый код;
- дублирующие действия.

Перед удалением:

```bash
rg "ИмяФайла|ИмяЭкспорта" src
npm run typecheck
npm run lint
npm run build
```

При замене реализации:

1. сохрани внешний контракт;
2. найди все вызовы;
3. перенеси или обнови тесты;
4. удали старый код после проверки;
5. не оставляй две реализации одной операции без явной причины.

---

# 21. Обязательные проверки

После завершения задачи всегда запускай:

```bash
npm run typecheck
npm run lint
npm run build
```

Вручную проверяй:

- desktop;
- tablet;
- mobile;
- loading / empty / error;
- основную успешную цепочку;
- keyboard navigation;
- focus;
- permissions;
- refresh;
- import/export или сохранение, если затронуты;
- существующие сценарии, которые могли быть затронуты.

---

# 22. Формат отчёта после реализации

В конце работы сообщай:

1. Какие файлы изменены.
2. Какие новые modules / features / shared components созданы.
3. Какая логика вынесена в action, hook или helper.
4. Какие файлы удалены и почему.
5. Что намеренно не менялось.
6. Результаты `typecheck`, `lint`, `build`.
7. Реальные ограничения и следующие шаги.

Не заявляй «всё работает», если проверки не запускались.

---

# 23. Чек-лист перед созданием новой feature

- [ ] Понятна пользовательская цель feature.
- [ ] Выбран правильный архитектурный слой.
- [ ] Проверены существующие actions, hooks и UI primitives.
- [ ] Нет копии существующей бизнес-логики.
- [ ] Public API модуля оформлен через `index.ts`.
- [ ] Нет deep import в чужой модуль.
- [ ] Определены server/client boundaries.
- [ ] Внешние данные валидируются runtime schema.
- [ ] Есть loading, empty и error state.
- [ ] Server mutation проверяет права.
- [ ] UI доступен с клавиатуры.
- [ ] Учитываются mobile и responsive layouts.
- [ ] Нет placeholder и dead code.
- [ ] Запущены `typecheck`, `lint`, `build`.

---

# 24. Короткая инструкция для ИИ

При создании любого React / Next.js проекта:

1. Сначала изучи код и правила проекта.
2. Сохраняй существующее поведение и UI, пока задача не требует изменений.
3. Повторяющуюся логику выноси только после реального повторения.
4. Не создавай пустые файлы, fake abstractions и дубли.
5. Одно действие должно иметь один источник истины.
6. Для Next.js используй Server Components по умолчанию.
7. Валидируй внешние данные на runtime и проверяй права на сервере.
8. Не используй `useEffect` для производных значений.
9. Не используй global state и memoization без причины.
10. Shared UI не должен знать о бизнес-домене.
11. Не скрывай ошибки и не оставляй незавершённые состояния интерфейса.
12. После изменений всегда запускай typecheck, lint и production build.
