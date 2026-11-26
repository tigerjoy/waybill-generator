# Component Breakdown — Waybill Generator (Svelte 5 + TypeScript)

_Rebuilt from the current Stitch prototypes in `docs/stitch_way_bill_generator/`.
This replaces the old Lit analysis. Treat it as a requirements inventory, not source code._

---

## 1. Current source files

| File | Step | Title | Lines |
| --- | --- | --- | --- |
| `step_1_bus_trip_details/code.html` | 1/5 | Bus & Trip Details | 418 |
| `step_2_morning_opening/code.html` | 2/5 | Morning Opening — Var 2: Accordion | 860 |
| `step_3_evening_closing/code.html` | 3/5 | Daily Way Bill — Evening Closing | 843 |
| `step_4_daily_expenses_staff_pay/code.html` | 4/5 | Daily Expenses & Staff Pay | 409 |
| `step_5_final_way_bill/code.html` | 5/5 | Final Way Bill | 519 |

### What changed since the previous version

- **Design language replaced.** No more "soft neo-brutalism" (yellow/pink/black hard shadows).
  Now a quiet Material-3-like token system: `light-surface`, `light-primary`, `success`,
  `light-outline-variant`, `rounded-md`, thin borders, `shadow-sm`.
- **Elements are labelled.** Every meaningful block carries
  `data-component-id`, `data-component-type`, `data-component-variant`, and text carries
  `data-design-text-token`. These attribute values are the component names below — use them.
- **Step 2 was redesigned.** No per-bundle Full/Chhit toggle. Full bundles are a *count*;
  Chhit bundles are a separate list with ticket ranges. Price and tickets-per-bundle are
  inline editors toggled by buttons.
- **Step 3 uses an aggregate return model.** Returns are tracked per rate
  (`returnedFullCount` + `returnedChhits[]`), not per bundle. A validation banner appears
  when returned > issued. The model is provisional — screen work only for now.
- **Totals changed**: sample sale ₹4,735, expenses ₹1,670, cash in hand ₹3,065.

---

## 2. Design tokens / visual system

From the Tailwind config + `data-design-text-token` attributes:

| Token | Meaning |
| --- | --- |
| `light-primary` `#00236F` | Primary buttons, active stepper, links |
| `light-surface` `#FAF7F2` | Page background |
| `light-surface-container-lowest` `#FFFFFF` | Card/input backgrounds |
| `light-surface-container-low` `#F3EFE6` | Nested panels |
| `light-surface-container` `#EBE6DC` | Segmented control track, chips |
| `light-surface-container-high` `#E3DDD2` | Inactive stepper segments |
| `light-on-surface` / `light-on-surface-variant` | Primary / secondary text |
| `light-outline-variant` `#D5CFC4` | Borders |
| `success` `#15803D`, `success-container` | Money-positive values, complete steps |
| `light-secondary` `#AC3400`, `light-secondary-container` | Expenses, stage badges |
| `light-error` `#BA1A1A`, `light-error-container` | Delete actions, validation warning |

Fonts: **Plus Jakarta Sans** (headline/title), **Open Sans** (body/label),
**Source Code Pro** (mono/numbers), Material Symbols Outlined for icons.

Implementation note: ship these as CSS custom properties, with compiled Tailwind v3 utilities
mapped to them in `tailwind.config.js` (Dev A-owned). **Do not use the Tailwind CDN script**
from the prototypes — it is a browser-side CSS compiler and is expensive on old phones and
slow networks.

---

## 3. Data model (from the inline scripts)

```ts
// You write these types yourself — see AGENTS.md
type Step = 'trip' | 'opening' | 'closing' | 'expenses' | 'final';

type Trip = {
  dateISO: string; date: string; busNo: string;
  driverName: string; driverLicense: string;
  conductorName: string; bagMoney: string;
};

type BundleMode = 'full' | 'chhit';
type Bundle = {
  mode: BundleMode;
  qty: number;
  perBundle: number;
  first: number | '';
  last: number | '';
  firstReturned?: 'all_sold' | 'all_returned' | number | '';
  lastReturned?: number | '';
  _autoLast?: boolean;        // Step 2 auto-fills `last` from `first`
};

type ChhitReturn = { first: number | ''; last: number | '' };

type Rate = {
  id: string;
  price: number;
  perBundle: number;
  bundles: Bundle[];
  returnedFullCount: number;  // aggregate model (Step 3)
  returnedChhits: ChhitReturn[];
};

type Expenses = {
  tripNo: string | number;
  driverPct: number; conductorPct: number;
  driverPay: number; conductorPay: number;
  diesel: number; pujo: number; petty: number; syndicate: number;
  toll: number; lateFine: number; tyreWork: number; mobil: number;
  totalExpenses: number; cashInHand: number;
};

type WaybillState = {
  trip?: Trip;
  rates?: Rate[];
  closing?: { totalSold: number; grandTotal: number };
  expenses?: Expenses;
};
```

**Scope note:** the model is provisional and only screens are being built right now.
Use the aggregate fields above; do not implement legacy migration or dual-format support.
If a prototype still shows older per-bundle return fields, treat that as stale markup.

`localStorage` keys (unchanged): `joymaa_waybill_v1` (trip), `joymaa_waybill_v2`
(rates/closing/expenses), `joymaa_saved_buses` (combobox options).

---

## 4. Shared shell / layout components

Attributes shown are the `data-component-*` values in the HTML.

| Svelte component | Source marker | Props / events |
| --- | --- | --- |
| `AppShell.svelte` | outer `max-w-md min-h-screen` div | slot for header/body/footer |
| `StepHeader.svelte` | sticky header | `brand`, `title`, `step`, `status`; slots for date + tabs |
| `Stepper.svelte` | `nav.grid-cols-5` | `current`, `complete` (step 5 uses `success` colour); emits navigate |
| `StatusPill.svelte` | `Step n of 5`, Opening/Closing, Auto | `label`, `variant: 'surface' \| 'secondary' \| 'success'` |
| `DateRow.svelte` | `card-interactive-2` | `value` (ISO), `display`; emits change; `showPicker()` |
| `StageTabs.svelte` | `tabs-with-icon` | `active: 'opening' \| 'closing'`; emits change |
| `Card.svelte` | `card` with variants `action`, `interactive`, `elevated`, `filled` | `variant`, `heading`, optional badge; slot |
| `StepFooter.svelte` | sticky footer | slots for totals + nav buttons |
| `Button.svelte` | `button-primary`, `secondary`, `tertiary`, `icon`, `icon-toggle`, `with-icon` | `variant`, `icon`, `label`, `disabled`; click |
| `TextField.svelte` | `input-field-text`, `input-field-icon` | `label`, `value`, `placeholder`, `mode`, `prefix`, `hint`; emits value change |
| `NumberStepper.svelte` | inline `− / value / +` control | `value`, `step`, `min`, `max`, `disabled`; emits change |
| `SummaryRow.svelte` | label + mono value rows | `label`, `value`, `tone` |
| `TotalRow.svelte` | Grand Total / TOTAL SALE / TOTAL EXPENSES | `label`, `value`, `variant` |
| `Banner.svelte` | info row, `role="alert"` warning | `message`, `variant: 'info' \| 'error'` |
| `Icon.svelte` | `.material-symbols-outlined` | `name`, `size` |
| `StepNavigation.svelte` | ✅ **already built** | `onBack`, `onNext` callback props |

---

## 5. Step-specific components

### Step 1 — `TripDetailsStep.svelte`

- `BusCombobox.svelte` — text input + saved-bus listbox from `joymaa_saved_buses`,
  filtering, toggle icon, "Save & …" option, outside-click close.
- `DateRow` reused for the date picker.
- Crew fields: `TextField` × 3 (driver name, license, conductor) + bag money with ₹ prefix
  and the "for reference only" hint.

### Step 2 — `OpeningStep.svelte`

- `RateList.svelte` — holds `rates` + `activeId`, `editingPriceId`, `editingPerBundleId`.
- `RateRow.svelte` (collapsed) — price, `+N Chhit` pill, subtitle like
  `2 Full + 1 Chhit · 250 tickets`, **inline full-bundle count stepper**, expand.
- `RateCard.svelte` (expanded) — title, edit-price pencil, issued pill, delete, collapse.
- `PriceEditor.svelte` — inline price input + Done button.
- `FullBundlesSection.svelte` — count stepper, `N / bundle`, `N tickets`, Edit button that
  reveals the tickets-per-bundle input.
- `ChhitBundle.svelte` — first/last ticket numbers, remove button, auto-fill last with
  `suggestNextHundred(first)` while `_autoLast` is true.
- `AddChhitButton.svelte` and `AddRateButton.svelte`.

### Step 3 — `ClosingStep.svelte`

- `CollectionSummary.svelte` — per-rate `sold × price` rows + Grand Total Collection.
- `ClosingRateCard.svelte` — expanded rate; composes the pieces below.
- `StatsStrip.svelte` — three columns Issued / Returned / Sold.
- `FullReturnedStepper.svelte` — count of full bundles returned, disabled at 0 and at the
  issued count.
- `ValidationBanner.svelte` — shown only when raw returned > issued; text includes both
  numbers and the cap.
- `ReturnedChhit.svelte` — first/last returned numbers, remove button.
- `AddReturnedChhitButton.svelte`.
- `ClosingRateFooter.svelte` — `Rate Total (N × ₹price)`.

### Step 4 — `ExpensesStep.svelte`

- `TripNumberField.svelte` — `−0.5 / input / +0.5`, step 0.5, min 0.
- `StaffPayRow.svelte` — percentage input + `N% of ₹totalSale` + computed amount.
- `ExpenseField.svelte` — one numeric field; render 8 of them from data:
  Diesel, Pujo, Petty (Starter), Syndicate Fund, Toll Tax, Late Fine, Tyre Work, Mobil.
- `ExpenseFooter.svelte` — Total Expenses (secondary colour) + Cash in Hand (success pill).

### Step 5 — `FinalWaybillStep.svelte`

- `WaybillInfoCard.svelte` — Date / Bus No. / Driver / Conductor / Trips / Bag Money.
- `TicketSalesTable.svelte` — 4-column Rate / Iss / Ret / Amount grid + TOTAL SALE.
- `ExpensesTable.svelte` — 10-row expense list + TOTAL EXPENSES.
- `SettlementCard.svelte` — `Total Sale − Total Expenses = Cash in Hand (Malik)`.
- `ShareButton.svelte` — Web Share API with clipboard fallback and "Copied!" feedback.

---

## 6. Pure logic to extract (no components)

Put these in `src/lib/` — you write them yourself:

| Module | Functions |
| --- | --- |
| `types.ts` | `Step`, `Trip`, `Bundle`, `Rate`, `Expenses`, `WaybillState` etc. |
| `calculations.ts` | `bundleIssued`, `chhitItemCount`, `getFullBundles`, `getChhitBundles`, `getPerBundle`, `rateIssued`, `rateCalc`, `suggestNextHundred` |
| `format.ts` | `fmtINR`, `parseNum`, `formatWaybillDate` |
| `totals.ts` | `totalSale(rates)`, `totalExpenses(expenses)`, `cashInHand(sale, expenses)` |

`rateCalc` returns `{ issued, fullIssuedCount, perBundle, retFull, rawReturned, returned,
sold, exceeded, amount }`. `returned` is capped at `issued`; `exceeded` drives the warning.

---

## 7. Suggested file layout

```
src/
  App.svelte                       ← owns step + WaybillState (already started)
  app.css                          ← compiled CSS tokens, no CDN
  lib/
    types.ts
    calculations.ts
    format.ts
    totals.ts
    components/
      StepHeading.svelte           ✅ exists
      StepNavigation.svelte        ✅ exists
      AppShell.svelte, StepHeader.svelte, Stepper.svelte, StatusPill.svelte
      DateRow.svelte, StageTabs.svelte, Card.svelte, Button.svelte
      TextField.svelte, NumberStepper.svelte, SummaryRow.svelte
      TotalRow.svelte, Banner.svelte, Icon.svelte
      steps/
        TripDetailsStep.svelte, BusCombobox.svelte
        OpeningStep.svelte, RateList.svelte, RateRow.svelte, RateCard.svelte
        PriceEditor.svelte, FullBundlesSection.svelte, ChhitBundle.svelte
        ClosingStep.svelte, CollectionSummary.svelte, ClosingRateCard.svelte
        StatsStrip.svelte, FullReturnedStepper.svelte, ReturnedChhit.svelte
        ExpensesStep.svelte, TripNumberField.svelte, StaffPayRow.svelte
        ExpenseField.svelte, ExpenseFooter.svelte
        FinalWaybillStep.svelte, WaybillInfoCard.svelte, TicketSalesTable.svelte
        ExpensesTable.svelte, SettlementCard.svelte, ShareButton.svelte
```

---

## 8. Build order (aligned with where you are now)

1. Hash routing: seed `step` from `location.hash`, sync with `$effect`, then `hashchange`.
2. Shell primitives: `AppShell`, `StepHeader`, `Stepper`, `Card`, `Button`, `StepFooter`.
3. `types.ts` + `format.ts` + `calculations.ts` (write the types before components use them).
4. Step 1: `TripDetailsStep` + `BusCombobox` + date + crew fields.
5. Step 2: full/chhit split, inline editors, totals.
6. Step 3: aggregate return model, stats strip, validation banner.
7. Step 4: staff pay + expense grid + footer.
8. Step 5: read-only tables + share.
9. Polish: CSS tokens, small fonts, service worker, GitHub Actions deploy with `base: '/<repo>/'`.

---

## 9. Things to verify as you go

- Does the sample data still sum correctly? Sale ₹4,735 − expenses ₹1,670 = cash ₹3,065.
- Step 3 caps returned tickets at issued and shows the warning when exceeded.
- Step 5 renders from the provisional model; no legacy branch is needed.
- No component owns its own copy of `rates` or `expenses` — state stays in `App.svelte`.
- Every number on screen comes from a pure function, not stored derived values.
