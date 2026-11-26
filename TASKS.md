# TASKS — Two-Developer, Conflict-Free Work Plan

**Scope:** build the five screens only. The data model is provisional; use the new aggregate
model (`returnedFullCount` + `returnedChhits[]`). **No legacy migration, no dual-format support,
no state wiring, no calculations, no persistence yet.**

Requirements reference: `docs/component-breakdown.md`. Teaching contract: `AGENTS.md`.

---

## 1. The one rule that prevents merge conflicts

> **One file has exactly one owner. Never edit a file you don't own.**

If you need a change in someone else's file, **say so in your PR description** and let that
file's owner make the change in their own task. Do not "just fix it quickly" — that is exactly
how conflicts happen.

Additional rules:

- One task = one branch = one PR. Branch names: `task/A1-tokens`, `task/B2-step4`, etc.
- Rebase onto `main` before opening a PR. Never force-push `main`.
- Run `npm run check` before PR; paste the result in the PR description.
- Never reformat, reorder imports in, or "tidy" a file you don't own.
- **No barrel files** (`index.ts`). Import components by direct path. Barrels are conflict magnets.
- If you need a preview, temporarily point `App.svelte` at your screen locally, but
  `git checkout -- src/App.svelte` before you stage anything. Only Dev A commits `App.svelte`.

### Frozen files (nobody edits during the screen phase)

`package.json`, `vite.config.ts`, `tsconfig*.json`, `AGENTS.md`, `docs/*`, `src/main.ts`,
`tailwind.config.js`, `postcss.config.js`.
If a change here is genuinely needed, open a note in your PR and Dev A handles it.

---

## 2. Ownership map

| Area | Owner | Files (all created/edited only by this owner) |
| --- | --- | --- |
| Design tokens + global CSS | **Dev A** | `src/app.css`, `src/lib/styles/tokens.css` |
| Tailwind + PostCSS config | **Dev A** | `tailwind.config.js`, `postcss.config.js` |
| Provisional types | **Dev A** | `src/lib/types.ts` |
| Shared UI primitives | **Dev A** | `src/lib/components/ui/*.svelte` |
| Shell primitives | **Dev A** | `src/lib/components/shell/*.svelte` |
| Step 1 screen | **Dev A** | `src/lib/components/steps/trip/*.svelte` |
| Step 2 screen | **Dev A** | `src/lib/components/steps/opening/*.svelte` |
| Integration | **Dev A** | `src/App.svelte` |
| Step 3 screen | **Dev B** | `src/lib/components/steps/closing/*.svelte` |
| Step 4 screen | **Dev B** | `src/lib/components/steps/expenses/*.svelte` |
| Step 5 screen | **Dev B** | `src/lib/components/steps/final/*.svelte` |

The two developers' file sets do not overlap. `App.svelte` is touched by exactly one person,
and only in the final integration task.

---

## 3. Frozen contract (so nobody has to wait for anyone)

### CSS token names — Dev A defines these in `tokens.css`; Dev B may use them immediately

```
--color-brand, --color-on-brand, --color-brand-soft
--color-page, --color-surface, --color-surface-muted
--color-surface-sunken, --color-surface-raised
--color-ink, --color-ink-muted
--color-border, --color-border-strong
--color-positive, --color-positive-soft
--color-accent, --color-accent-soft
--color-negative, --color-negative-soft
--font-heading, --font-body, --font-number
```

`src/lib/styles/tokens.css` is now populated (written at the user's request). The full list
with role comments lives there — read it rather than guessing a name.

Rule for all screens: **no hard-coded hex colours**. Use the Tailwind utilities backed by
these tokens (e.g. `bg-primary`, `text-on-surface-variant`, `border-outline-variant`).
Dev A publishes the exact class-name mapping in the A1 PR.

### Provisional type names — Dev A owns the file; screens may define local sample data

`Step`, `Trip`, `Bundle`, `BundleMode`, `ChhitReturn`, `Rate`, `Expenses`, `WaybillState`.
If a screen needs a field that isn't there, use a local type in your own file and describe the
needed change in your PR. Do not edit `types.ts`.

### Screen component contract — every step screen accepts no props during this phase

Each step screen renders from its own local sample data and has **no callbacks, no stores,
no `$state` for domain data** yet. That keeps screens independent. Wiring happens in A7.

---

## 4. Task list

### Dev A tasks

#### A1 — Design tokens, global CSS, and Tailwind setup
- **Files:** `src/app.css`, `src/lib/styles/tokens.css`, `tailwind.config.js`,
  `postcss.config.js` (all new or Dev A-owned).
- `tokens.css` is already populated with the agreed names and role comments — use it as the
  source of truth; values are reference-only.
- Configure Tailwind **v3**: content globs covering `./index.html` and
  `./src/**/*.{svelte,js,ts}`; map theme colours to the CSS variables, e.g.
  `brand: 'var(--color-brand)'`, `positive: 'var(--color-positive)'`. Add the three
  `@tailwind` directives to `app.css`.
- Set the body font, background, and a `.wb-mono` / `.wb-heading` utility.
- **Done when:** a scratch element using `bg-brand` renders the same blue as
  `var(--color-brand)`; no Tailwind CDN `<script>` anywhere; `npm run check` clean.

#### A2 — Provisional types
- **Files:** `src/lib/types.ts` (new)
- Write the types listed in §3 using the new model only. Include `returnedFullCount` and
  `returnedChhits` on `Rate`. Do **not** add legacy fields or migration helpers.
- **Done when:** file compiles; no `any`; PR lists the final field names so Dev B can align.

#### A3 — Shared UI primitives
- **Files:** one `.svelte` per component in `src/lib/components/ui/`: `Card`, `Button`,
  `TextField`, `NumberStepper`, `SummaryRow`, `TotalRow`, `Banner`, `Icon`.
- Props: use the names in `docs/component-breakdown.md` §4. Callback props, not events from a dispatcher.
- **Done when:** each renders a tiny sample in isolation; `npm run check` clean.

#### A4 — Shell primitives
- **Files:** one `.svelte` per component in `src/lib/components/shell/`: `AppShell`,
  `StepHeader`, `Stepper`, `StatusPill`, `DateRow`, `StageTabs`, `StepFooter`.
- **Done when:** all render with static sample props; no routing or state.

#### A5 — Step 1 screen: Bus & Trip Details
- **Files:** `src/lib/components/steps/trip/TripDetailsStep.svelte`, `BusCombobox.svelte`
- Render: stepper header, Trip Info card (date row, bus combobox), Staff on Duty card
  (driver, license, conductor, bag money with ₹ prefix and hint), Next footer.
- Static listbox sample for saved buses; **no localStorage, no filtering logic yet**.
- **Done when:** visually matches `step_1_bus_trip_details/code.html`; `npm run check` clean.

#### A6 — Step 2 screen: Morning Opening
- **Files:** `src/lib/components/steps/opening/*.svelte` only
  (`OpeningStep`, `RateList`, `RateRow`, `RateCard`, `PriceEditor`, `FullBundlesSection`,
  `ChhitBundle`, plus add-button components if useful).
- Render: Add New Ticket Rate button, collapsed rows with inline full-bundle stepper and
  `+N Chhit` pill, expanded ₹10 card with edit-price, full-bundle count + tickets/bundle
  editor, Chhit bundles with first/last numbers, Add Chhit Bundle, totals footer.
- Static sample data; interactions can toggle local UI only. **No persistence.**
- **Done when:** matches `step_2_morning_opening/code.html`; `npm run check` clean.

#### A7 — Integration (do this LAST, after B1–B3 are merged)
- **Files:** `src/App.svelte` only (plus hash routing here)
- Import all five step screens, render the current one from `step`, wire `StepNavigation`,
  add hash routing (seed from `location.hash`, sync with `$effect`, then `hashchange`).
- **Done when:** clicking Back/Next walks all five screens; reload preserves the step;
  `npm run check` clean.

### Dev B tasks (pick up in any order)

#### B1 — Step 3 screen: Evening Closing
- **Files:** `src/lib/components/steps/closing/*.svelte` only
  (`ClosingStep`, `CollectionSummary`, `ClosingRateCard`, `StatsStrip`,
  `FullReturnedStepper`, `ReturnedChhit`, `ValidationBanner`, `ClosingRateFooter`).
- Render: info banner, Daily Collection Summary with Grand Total Collection
  (₹5,235 sample), collapsed rate rows, expanded ₹10 card with stats strip, full bundles
  returned stepper, returned-chhit list, validation warning (show it in its warning state
  with sample numbers), rate total footer, submit footer.
- Use the **aggregate model only**. **No legacy branch, no calculations, no persistence.**
- **Done when:** matches `step_3_evening_closing/code.html`; `npm run check` clean.

#### B2 — Step 4 screen: Daily Expenses & Staff Pay
- **Files:** `src/lib/components/steps/expenses/*.svelte` only
  (`ExpensesStep`, `TripNumberField`, `StaffPayRow`, `ExpenseField`, `ExpenseFooter`).
- Render: Total Ticket Sale banner (₹4,735), trip number ±0.5, driver 13% → ₹616,
  conductor 10% → ₹474, eight expense fields, footer total ₹1,670 and cash ₹3,065.
- Numbers are static sample values. **No recalculation yet.**
- **Done when:** matches `step_4_daily_expenses_staff_pay/code.html`; `npm run check` clean.

#### B3 — Step 5 screen: Final Way Bill
- **Files:** `src/lib/components/steps/final/*.svelte` only
  (`FinalWaybillStep`, `WaybillInfoCard`, `TicketSalesTable`, `ExpensesTable`,
  `SettlementCard`, `ShareButton`).
- Render: paper-style info card, Ticket Sales 4-column table (Rate/Iss/Ret/Amount) with
  438 sold and ₹4,735 total, expenses list with ₹1,670 total, settlement ₹3,065,
  Edit/Share/Done action bar.
- Share button may show a static "Copied!" on click; **no real Web Share API yet**.
- **Done when:** matches `step_5_final_waybill/code.html`; `npm run check` clean.

---

## 5. Definition of done (every task)

- Only files in your ownership column were changed.
- Screen uses compiled Tailwind utilities backed by `--color-*` / `--font-*` tokens; no hard-coded colours,
  no Tailwind CDN script.
- Screen is self-contained: no imports from the other developer's folders.
- No domain state, calculations, localStorage, or legacy handling.
- `npm run check` reports 0 errors.
- PR description says what you rendered and any request for a file you don't own.

## 6. Backlog — after all screens are merged

These come later, each as its own single-owner task:

1. `src/lib/format.ts` — `fmtINR`, `parseNum`, `formatWaybillDate` (Dev A)
2. `src/lib/calculations.ts` — `rateCalc`, totals, `suggestNextHundred` (Dev A)
3. Replace static sample data with state passed from `App.svelte` (Dev A, with input from Dev B)
4. Validation behaviour for returned > issued (Dev B, after state wiring)
5. Real Share button (Dev B)
6. Compiled CSS polish, minimal fonts, service worker (Dev A)
7. GitHub Actions + Vite `base: '/<repo>/'` (Dev A only)

---

## 7. Quick conflict checklist before you commit

- Did I edit `App.svelte` and I am not Dev A on task A7? → revert it.
- Did I edit another developer's step folder? → revert it.
- Did I edit `app.css`, `types.ts`, Tailwind config, or a shared component and I am not Dev A? → revert it.
- Am I committing a barrel file or a reformat of someone else's code? → don't.
- Did I run `npm run check`? → if not, do it now.
