# Learning Progress — Waybill Generator (Svelte 5 + TypeScript)

_Last updated: 2026-11-26. This is a learning log, not source code. The teaching contract lives in `AGENTS.md`._

## Where we are

A Vite + Svelte 5 + TypeScript SPA scaffold has been converted into a **working 5-step switcher**:

- `trip → opening → closing → expenses → final → trip` (wraps in both directions)
- Back and Next buttons live in a child component that knows nothing about steps
- `svelte-check` reports **0 errors, 0 warnings**

## Concepts learned so far

1. **Reactivity (`$state`)** — only values declared with the rune trigger updates. Plain `const` objects don't. Svelte updates only the DOM nodes that read the changed value, not the whole tree.
2. **`{#if} / {:else if}`** — conditional rendering. At first every branch rendered the same thing, so it wasn't deciding anything; later each branch got distinct placeholder content.
3. **Single source of truth for types** — declare the literal array with `as const`, then derive `type Step = (typeof STEP_KEYS)[number]`. Without `as const`, the array widens to `string[]` and the five literal values are lost.
4. **`satisfies`** — checks an object conforms to `Record<Step, number>` / `Record<Step, string>` while preserving literal types. Unlike a plain type annotation, it doesn't widen the expression. It also catches a missing key.
5. **`reduce<T>`** — the generic types the accumulator (`acc`) and therefore the result. A starting value of `{}` alone infers `{}`, which can't be indexed by a `Step` key. `{} as Record<Step, number>` is a justified assertion because the source array covers every key exactly once.
6. **Props (`$props()`)** — destructured from a typed object. Required props are checked at compile time (`<StepHeading />` without `title` produces ts(2741)). Props flow **parent → child**.
7. **Callback props** — child → parent communication. The child receives functions (`onBack`, `onNext`) and calls them; the functions are defined in the parent. The child stays ignorant of the domain.
8. **Compiler as teacher** — `npm run check` after every change. An initial `Cannot find module 'esrap'` error was an incomplete `node_modules`, fixed by `npm install`; it was not an application-code error.
9. **Hygiene** — delete dead commented-out code and TODO comments once the task is done. `const` for props you never reassign.

## Files so far

| File | Role |
| --- | --- |
| `src/App.svelte` | Owns `step` state, `STEP_KEYS` / `STEPS` / `STEP_NAMES`, `goNext`, `goBack`; renders headings and branch placeholders |
| `src/lib/components/StepHeading.svelte` | Takes `title: string` prop, renders `<h1>` |
| `src/lib/components/StepNavigation.svelte` | Takes `onBack` / `onNext` callback props, renders two buttons |
| `AGENTS.md` | Standing teaching instructions — I guide, you write all code |
| `docs/component-breakdown.md` | Current requirements/component inventory, rebuilt from the updated Stitch prototypes |
| `docs/PROGRESS.md` | This file |

## Current behaviour to verify by hand

- Click Next five times → wraps back to `trip`.
- Click Back from `trip` → wraps to `final`.
- Reload → currently resets to `trip` (hash routing not yet added).

## Open items / things to revisit

- **JS negative indices:** `arr[-1]` is `undefined`, not the last element. The `+ length` in `goBack` prevents a negative index before `%`.
- **Data-flow direction:** correct statement is props go **App → StepNavigation** (down); callbacks are invoked in the child but run parent code (control goes up).
- **Naming:** the variable `nextStepNumber` inside `goBack` would be clearer as `prevStepNumber` or `targetIndex`.
- **Unanswered teach-back:** why `as const` matters for `typeof STEP_KEYS[number]` (answer: without it the array widens to `string[]`, so indexing yields `string`, not the literal union).

## Next steps, in order

1. **Hash routing** — seed `step` from `location.hash` on startup; write `step` back with `$effect`. Test by clicking to `closing` and reloading.
2. **Browser Back/forward** — listen for `hashchange`.
3. **Real step components** — replace the five placeholder branches with components from `docs/component-breakdown.md`.
4. **Root state object** — add `trip`, `rates`, `closing`, `expenses` with pure calculation functions and `localStorage` persistence.
5. **Styling** — compiled CSS only (no Tailwind CDN), minimal fonts, mobile-first.
6. **Deploy** — GitHub Actions workflow, Vite `base: '/<repo>/'`, hash routing needs no server rewrite.

## How to resume

Say **"resume"** and ask me to re-read `AGENTS.md` and `docs/PROGRESS.md`. Then I'll ask what you tried last and give the next small hint — I won't write app code for you.

Optional git checkpoint (you run it):

```bash
git add docs/PROGRESS.md src && git commit -m "Checkpoint: Svelte step switcher with props and callbacks"
```
