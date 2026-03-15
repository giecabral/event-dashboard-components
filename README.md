# Event Dashboard

A single-page React application showcasing three reusable components — **DataGrid**, **Timeline**, and **EventForm** — built as part of a front-end technical assessment.

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Tech Stack

| Concern | Library | Why |
|---|---|---|
| Framework | React 19 + TypeScript + Vite | Fast DX, strict typing throughout |
| Styling | Tailwind CSS v3 | Utility-first; no context-switching between files |
| Table | TanStack Table v8 | Headless — full control over markup and accessibility |
| State | Zustand | Minimal boilerplate for a flat, shared event store |
| Form | react-hook-form + Zod | Uncontrolled inputs with schema-driven validation |
| UI primitives | Radix UI Dialog + Base UI Select/Tooltip | Accessible out of the box; unstyled so Tailwind owns the look |
| Toasts | Sonner | Lightweight, accessible `aria-live` announcements |
| Mock data | Faker.js | Realistic, reproducible dataset (seeded with `42`) |
| Date utilities | date-fns | Tree-shakeable; no moment.js bloat |

---

## Project Structure

```
src/
├── components/
│   ├── DataGrid/
│   │   ├── DataGrid.tsx            # Orchestrator: state + table config only
│   │   ├── DataGridToolbar.tsx     # Search input + column visibility toggle
│   │   ├── DataGridHeader.tsx      # Sortable thead
│   │   ├── DataGridBody.tsx        # All tbody states (skeleton, error, empty, rows)
│   │   ├── DataGridPagination.tsx  # Page size selector + prev/next + count
│   │   ├── ColumnToggle.tsx        # Column visibility dropdown
│   │   └── index.ts
│   ├── Timeline/
│   │   ├── Timeline.tsx            # Keyboard nav, grouping logic, skeleton state
│   │   ├── TimelineGroup.tsx       # Day header + list of items
│   │   ├── TimelineItem.tsx        # Individual event card
│   │   └── index.ts
│   ├── EventForm/
│   │   ├── EventForm.tsx           # Modal form for add / edit
│   │   ├── schema.ts               # Zod validation schema
│   │   └── index.ts
│   └── ui/
│       ├── select.tsx              # Base UI Select (shadcn-style)
│       └── tooltip.tsx             # Base UI Tooltip (shadcn-style)
├── data/
│   └── mockEvents.ts               # 200 seeded Faker events
├── hooks/
│   └── useAnnouncer.ts             # aria-live region for screen reader announcements
├── lib/
│   ├── categoryColors.ts           # Badge color maps for category and status
│   └── utils.ts                    # cn() Tailwind merge helper
├── store/
│   └── events.ts                   # Zustand store
└── App.tsx                         # Layout, date filter, edit/create orchestration
```

---

## Components

### DataGrid

A fully client-side data table built on TanStack Table v8.

**Features**
- Pagination with configurable page size (5 / 10 / 15 / 25)
- Column sorting (ascending / descending / neutral) with keyboard support
- Global text search across all columns except date, with instant page reset on input
- Column visibility toggle (hide / show per column)
- Loading skeleton — animated pulse rows that match the visible column count
- Empty and error states
- Hover edit affordance (pencil icon) when `onRowClick` is provided
- Native `title` tooltip on every cell for truncated content

**Architecture**

`DataGrid` owns all state and the TanStack table instance, then composes four focused sub-components:

- `DataGridToolbar` — search + column toggle
- `DataGridHeader` — sortable `<thead>`
- `DataGridBody` — all `<tbody>` states
- `DataGridPagination` — page info + controls

Each sub-component receives `table: Table<Event>` as its primary prop, using TanStack's API as the shared interface rather than duplicating derived values through the prop tree. `DataGridBody` additionally receives `isLoading`, `error`, and `onRowClick` — concerns that live outside the table model.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Event[]` | — | Row data |
| `columns` | `DataGridColumn[]` | — | Column definitions |
| `isLoading` | `boolean` | `false` | Shows skeleton rows |
| `error` | `string \| null` | `null` | Shows error state |
| `pageSize` | `number` | `10` | Initial rows per page |
| `onRowClick` | `(event: Event) => void` | — | Row click handler |

---

### Timeline

A keyboard-navigable, screen-reader-friendly chronological view of events grouped by day.

**Features**
- Events grouped by calendar day, sorted chronologically
- Full keyboard navigation using the WAI-ARIA tree pattern:
  - `Left` / `Right` — move between day groups
  - `Up` / `Down` — move between items within a day
- Screen reader announcements on every focus change via a dedicated `useAnnouncer` hook (`aria-live="polite"`)
- Roving tabindex — only the currently active element holds `tabIndex=0`, keeping the entire timeline a single Tab stop
- The tree container itself is focusable (`tabIndex=0`) so keyboard navigation can begin without a prior mouse click
- Loading skeleton that mirrors the real group/card structure
- Empty state

**Why group by day?**
Events have an explicit `date` field, and users naturally think in terms of "what's happening on a given day." Day grouping makes the schedule scannable at a glance and maps directly to the data model with no extra derivation.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `Event[]` | — | Events to display |
| `isLoading` | `boolean` | `false` | Shows skeleton |
| `onItemClick` | `(event: Event) => void` | — | Card click / Enter handler |
| `className` | `string` | — | Additional wrapper classes |

---

### EventForm

A modal dialog for creating and editing events.

**Features**
- Controlled inputs with Zod schema validation via `react-hook-form`
- Real-time validation (`mode: 'onChange'`) — save button is disabled until all required fields pass
- Inline error messages below each field (`role="alert"`)
- Automatically focuses the first invalid field when a submit attempt fails
- Cancel closes the dialog; a successful save shows a toast notification and closes the dialog
- Resets to default or initial values whenever the dialog opens or the event being edited changes
- Edit mode is detected automatically from `initialData` — the title and submit button label update accordingly

**Validation rules**

| Field | Rule |
|---|---|
| Title | Required |
| Date | Required, must match `YYYY-MM-DD` |
| Time | Required |
| Location | Required |
| Category | Required (Conference / Workshop / Meetup / Webinar / Social / Training) |
| Status | Required (scheduled / completed / cancelled) |
| Organizer | Required |
| Attendees | Required, integer ≥ 1 |
| Description | Optional |

**Props**

| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controls dialog visibility |
| `onClose` | `() => void` | Called when the dialog should close |
| `onSave` | `(data: EventFormData) => void` | Called with validated form data on save |
| `initialData` | `Event` (optional) | Pre-fills the form for edit mode |

---

## Data & State

### Mock Data

`src/data/mockEvents.ts` generates 200 events using Faker.js with a fixed seed (`42`) for reproducible data across hot reloads. Events are spread across 2025-01-01 to 2025-12-31 with randomised titles, locations, categories, statuses, attendee counts, and organizers. The array is pre-sorted by date so TanStack Table's initial sort state is consistent on first render.

### State Management — Zustand

A single Zustand store (`src/store/events.ts`) holds the event array and exposes two mutations:

- `addEvent` — appends a new event with a `crypto.randomUUID()` id
- `updateEvent` — merges partial updates by id

Zustand was chosen over Context + `useReducer` for its minimal boilerplate and to avoid unnecessary re-renders — components subscribe only to the slices they use.

### App-Level Filtering

Date range filtering lives in `App.tsx` rather than inside either component. A single `filteredEvents` array (derived with `useMemo`) flows into both `DataGrid` and `Timeline`, keeping them in perfect sync without any cross-component communication. The DataGrid handles its own text search internally via TanStack's `globalFilterFn`.

---

## Accessibility

| Feature | Implementation |
|---|---|
| Screen reader announcements | `useAnnouncer` — a dedicated `aria-live="polite"` region; text is cleared before each update so identical consecutive messages are always re-read |
| Timeline keyboard navigation | WAI-ARIA tree pattern with roving tabindex |
| Sortable column headers | `role="button"`, `aria-sort`, keyboard activation via Enter / Space |
| Column visibility toggle | `role="listbox"` with `aria-selected` per option |
| Form error messages | `role="alert"` inline messages, `aria-invalid` on inputs |
| Modal dialog | Radix UI Dialog with focus trap; focus is explicitly returned to the triggering element on close to preserve keyboard navigation state |
| Tooltips | Base UI Tooltip |
| Edit affordance icons | `aria-hidden="true"` — the row / card already carries a full accessible label |
