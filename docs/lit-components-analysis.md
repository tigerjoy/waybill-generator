# Lit Component Analysis — Waybill Generator

> Derived from the five Stitch-generated HTML prototypes in
> `docs/stitch_way_bill_generator/`. Each prototype uses Tailwind CDN, a
> per-page inline `<script>`, and `localStorage` for state. This document maps
> that markup and behaviour to reusable Lit web components.

---

## 1. Source files

| File | Step | Core job |
| --- | --- | --- |
| `step_1_bus_trip_details_soft_neo_brutalism/code.html` | 1/5 | Trip + crew details, bus-number autocomplete |
| `step_2_morning_opening_soft_neo_brutalism/code.html` | 2/5 | Configure ticket rates & bundles, count issued tickets |
| `step_3_evening_closing_soft_neo_brutalism/code.html` | 3/5 | Enter returned tickets → auto-compute sold & ₹ per rate |
| `step_4_daily_expenses_soft_neo_brutalism/code.html` | 4/5 | Staff % pay + 8 expense fields → total expenses, cash in hand |
| `step_5_final_way_bill_soft_neo_brutalism/code.html` | 5/5 | Read-only printable sheet + share |

### Shared state (currently in `localStorage`)

| Key | Shape |
| --- | --- |
| `joymaa_waybill_v1` | `{ trip: { dateISO, date, busNo, driverName, driverLicense, conductorName, bagMoney } }` |
| `joymaa_waybill_v2` | `{ rates: Rate[], closing: { totalSold, grandTotal }, expenses: {...} }` |
| `joymaa_saved_buses` | `string[]` — persisted bus-number combobox options |

```js
// Core data model
Rate   = { id, price, bundles: Bundle[] }
Bundle = {
  mode: 'full' | 'chhit',
  qty, perBundle,           // full-bundle ticket count
  first, last,              // chhit ticket-number range
  firstReturned,            // 'all_sold' | 'all_returned' | number | ''
  lastReturned              // number | '' (full bundles only)
}
```

---

## 2. Shared shell / layout components (used by all 5 pages)

| Lit component | Derived from the HTML | Properties / API |
| --- | --- | --- |
| `wb-app-shell` | outer `max-w-md min-h-screen` wrapper | slots: `header`, body, `footer` |
| `wb-step-header` | sticky yellow header with brand + title + step badge | `brand`, `title`, `step`, `statusLabel`, `statusVariant`; slot for extra controls |
| `wb-stepper` | 5-segment progress nav | `current`, `links[]`; emits `step-navigate` |
| `wb-status-pill` | `STEP n/5`, `OPEN`, `CLOSE`, `OPENING SAVED`, `AUTO`, `SAVED` | `label`, `variant` (`white` / `green` / `pink` / `dark`) |
| `wb-sticky-footer` | fixed bottom action bar | slots for totals + nav buttons |
| `wb-nav-button` | Back / Next / Save / Submit / Done / Edit / Share | `label`, `icon`, `variant`, `href`; emits `click` |
| `wb-card` | White / purple / green / pink rounded cards with hard shadow | `heading`, `badge`, `variant`; default slot |
| `wb-summary-row` | label + value rows in summary & expense lists | `label`, `value`, `emphasis` |
| `wb-total-row` | highlighted Grand Total / TOTAL SALE / TOTAL EXPENSES row | `label`, `value`, `variant` |
| `wb-info-banner` | pink guidance banner & green "Total Ticket Sale" banner | `message`, `icon`, `variant` |
| `wb-material-icon` | material-symbols spans | `name`, `size` — or keep the font + CSS class globally |
| `wb-date-field` | date picker row with formatted display | `value` (ISO), `display`; emits `date-change`; calls `showPicker()` |
| `wb-text-field` | labeled inputs: uppercase label, hint, mono/numeric variant, ₹ prefix | `label`, `value`, `placeholder`, `hint`, `prefix`, `mode`, `disabled`, `readonly`; emits `value-changed` |
| `wb-icon-button` | round delete / collapse / add / close buttons | `icon`, `label`, `variant`, `size`; emits `click` |
| `wb-segmented-control` | generic segmented toggle (2–3 options) | `options[]`, `value`; emits `value-changed`. Specialize as `wb-stage-switcher`, `wb-bundle-mode-toggle`, `wb-closing-status-toggle` |
| `wb-number-stepper` | `− / input / +` control | `value`, `step`, `min`, `formatter`; emits `value-changed` |

---

## 3. Step-specific domain components

### Step 1 — `wb-trip-details-step`

- `wb-bus-combobox` ⭐ — the most substantial component. Text input + saved-bus
  listbox from `joymaa_saved_buses`, filtering, icon toggle, "Save & …" option,
  outside-click close. Emits `value-changed`, `bus-saved`.
- `wb-trip-form` — composes `wb-date-field`, `wb-bus-combobox`, driver /
  license / conductor `wb-text-field`s and the bag-money field (₹ prefix,
  "for reference only" hint).

### Step 2 — `wb-opening-step`

- `wb-rate-list` — holds `rates[]` + `activeId`; renders one expanded card and
  collapsed rows.
- `wb-rate-card` / `wb-rate-row` — expanded editor vs. collapsed summary row.
- `wb-bundle-editor` — mode toggle (Full Bundle / Chhit Tickets), ticket-count
  stepper or first/last ticket numbers, remove bundle, "Add Another Bundle".
- `wb-add-rate-button` — dashed full-width add button.

### Step 3 — `wb-closing-step`

- `wb-collection-summary` — auto per-rate `sold × price` rows + grand total.
- `wb-closing-rate-card` — expanded rate with closing controls + rate footer total.
- `wb-bundle-closing-editor` — status toggle (All Sold / Unsold / Partial),
  "first returned no." + "last returned no." inputs (editable for Full bundles,
  read-only fixed for Chhit).
- `wb-bundle-stats` — 3-column Issued / Returned / Sold display.

### Step 4 — `wb-expenses-step`

- `wb-trip-number-field` — wraps `wb-number-stepper` with `step = 0.5` and helper text.
- `wb-staff-pay-row` — percentage input + "13% of ₹1,330" sublabel + computed ₹ amount.
- `wb-expense-field` — one numeric field; data-driven grid of 8:
  Diesel, Pujo, Petty (Starter), Syndicate Fund, Toll Tax, Late Fine, Tyre Work, Mobil.
- `wb-expense-footer` — Total Expenses (red) + Cash in Hand (green pill).

### Step 5 — `wb-final-waybill-step`

- `wb-waybill-info-card` — read-only Date / Bus / Driver / Conductor / Trips /
  Bag Money grid.
- `wb-ticket-sales-table` — 4-column Rate / Iss / Ret / Amount grid + TOTAL SALE.
- `wb-expenses-table` — expense list + TOTAL EXPENSES.
- `wb-settlement-card` — `Total Sale − Expenses = Cash in Hand (Malik)`.
- `wb-share-button` — Web Share API with clipboard fallback and "Copied!" feedback.

---

## 4. Non-component pieces worth extracting (important for Lit)

### `WaybillController` (ReactiveController)
Single source of truth replacing the duplicated `loadState()` / `saveX()`
functions in all five inline scripts. Holds `trip`, `rates`, `closing`,
`expenses` and persists to both `localStorage` keys:

```ts
class WaybillController implements ReactiveController {
  @state() trip: Trip;
  @state() rates: Rate[];
  @state() closing: Closing;
  @state() expenses: Expenses;

  hostConnected() { /* load from localStorage */ }
  saveTrip(...) { /* ... */ }
  saveRates(...) { /* ... */ }
  saveClosing() { /* ... */ }
  saveExpenses(...) { /* ... */ }
}
```

An alternative is a Context provider (`@lit/context`) so deeply nested
components (bundle editors) don't require prop drilling.

### Calculation utilities (pure functions)
Currently duplicated in Step 3 and Step 5 — centralise these:

- `bundleIssued(bundle)` — full: `perBundle`; chhit: `last - first + 1`
- `bundleCalc(bundle)` → `{ issued, returned, sold, first, last, effectiveLast }`
- `rateCalc(rate)` → `{ issued, returned, sold, amount }`
- `totalSale(rates)`, `totalExpenses(expenses)`, `cashInHand(sale, expenses)`
- `formatINR(n)` — en-IN grouping, `−₹` for negatives
- `parseNum(str)` — strip non-numeric chars, default 0
- `formatWaybillDate(iso)` — `Tue, 24 Nov 2026`

Returned-ticket rule (currently in `bundleCalc`):
`all_returned` → all issued; numeric `firstReturned` (+ optional
`lastReturned`) → `min(issued, effectiveLast - firstReturned + 1)`;
`all_sold` → 0. Sold = `issued - returned`.

### Design tokens
Move the "soft neo-brutalism" palette, fonts and hard shadows into CSS custom
properties in one shared stylesheet; Lit's scoped styles inherit them cleanly:

- Colours: `#F6F3FF` bg, `#FFCA7A` header, `#C8EC74` highlight, `#FFA8E2` accent,
  `#DDD6FE` summary, `#232325` ink, `#18181B` border.
- Fonts: Space Grotesk (headings), Open Sans (body), Source Code Pro (mono/numbers).
- Effects: `border-2 border-[#18181B]`, `rounded-3xl`, `shadow-[0_4px_0_#18181B]`.

---

## 5. Suggested build order

1. Tokens + primitives: `wb-card`, `wb-text-field`, `wb-icon-button`,
   `wb-segmented-control`, `wb-number-stepper`, `wb-step-header`, `wb-stepper`,
   `wb-sticky-footer`, `wb-app-shell`.
2. `WaybillController` + calculation/format utilities.
3. Steps 1 → 4 forms, then Step 5 read-only sheet.
4. Wire navigation and persistence last.

### Proposed folder structure

```
src/
  controllers/waybill-controller.ts
  lib/calculations.ts
  lib/format.ts
  lib/types.ts
  styles/tokens.css
  components/
    wb-app-shell.ts
    wb-step-header.ts
    wb-stepper.ts
    wb-status-pill.ts
    wb-sticky-footer.ts
    wb-nav-button.ts
    wb-card.ts
    wb-text-field.ts
    wb-number-stepper.ts
    wb-segmented-control.ts
    wb-icon-button.ts
    wb-summary-row.ts
    wb-total-row.ts
    wb-info-banner.ts
    wb-date-field.ts
    wb-bus-combobox.ts
    wb-bundle-editor.ts
    wb-bundle-closing-editor.ts
    wb-bundle-stats.ts
    wb-staff-pay-row.ts
    wb-expense-field.ts
    wb-share-button.ts
  steps/
    wb-trip-details-step.ts
    wb-opening-step.ts
    wb-closing-step.ts
    wb-expenses-step.ts
    wb-final-waybill-step.ts
  wb-app.ts
index.html
```

---

## 6. Notes

- The workspace currently contains only these five docs HTML files — no Lit
  scaffold exists yet.
- Step 3's markup is largely generated in JS (one long minified line in the
  HTML), so treat its inline `render()` function as the source of truth for
  `wb-closing-rate-card` / `wb-bundle-closing-editor`.
- All five pages duplicate the same header, stepper, footer and tailwind config;
  those should be rendered once by Lit components rather than repeated.
