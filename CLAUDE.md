# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # production build to dist/
npm run preview   # serve built dist/
npm run lint      # ESLint over the repo (flat config in eslint.config.js)
```

No test runner is configured. Do not invent one; if tests are added, update this file.

## What this app is

`cr-app` is the **Contract Representative (CR) workspace** for Aramco iProcurement. It is an enterprise dashboard for the *bidding & award* slice of the Services PR lifecycle (Phases 3–4 of the parent project — see `../PROJECT_MEMORY.md`). It is built with React 19 + Vite + React Router 7.

The app is intentionally **mockup-data driven**: every list, KPI, pipeline stage, inbox row, gate, and activity entry is a literal object in `src/data/constants.js`. There is no API, no auth, no persistence layer. Treat the data file as the contract — pages render whatever it exports. When asked to "wire something up," extend `constants.js` and consume from there; do not stub fetches.

The target user is the persona **Mohammed Al-Ghamdi · CD-PSCM**. The in-app AI assistant is named **Procura** (right rail). Keep domain copy in this voice — Saudi Aramco procurement terminology (LFPA/SFPA/GCS, IKTVA, SRC routing ≥ $50M, CE +5% rule, Saudization, BRT/IRT, Schedule B/C). `../PROJECT_MEMORY.md` is the authoritative domain glossary.

## Architecture

```
src/
  main.jsx          # mounts <App/> in StrictMode; imports tokens.css → shell.css → workspace.css (order matters)
  App.jsx           # BrowserRouter; one parent <Shell/> route wraps all pages via <Outlet/>
  components/
    Shell.jsx       # layout shell: <Sidebar/> + <main> (topbar + Outlet) + <ProcuraRail/>
    Sidebar.jsx     # dark left nav, tabs (Chat/Create/Ideate), workflow rows route via WORKFLOW_ROUTES map
    ProcuraRail.jsx # right AI rail (currently static suggestions)
    Icons.jsx       # SVG factory <I/> + ICO export object — add icons here, do not inline SVG in pages
  pages/
    Workspace.jsx   # the ONLY fully-built page (KPIs · action cards · pipeline · inbox · gates · feed)
    PADraft.jsx, FunctionalReview.jsx, BidEvaluation.jsx, AwardSign.jsx
                    # placeholders ("coming soon" cards); these are the next builds
  data/constants.js # SIDEBAR_NAV, PINNED/BIDDING/RECENT_CONTRACTS, KPI_DATA, ACTION_CARDS,
                    # PIPELINE_STAGES, INBOX_ROWS, GATES_PENDING, ACTIVITY_FEED
  hooks/useTheme.js # stub — app is light-only; do not wire it unless asked
  styles/
    tokens.css      # design tokens (colors, elevation, motion, layout widths) — single source of truth
    shell.css       # sidebar + topbar + global chrome (~1150 lines)
    workspace.css   # dashboard-specific styles (~1400 lines)
```

Route table (`Shell` reads `PAGE_LABELS` for breadcrumb; `Sidebar` reads `WORKFLOW_ROUTES` for active state — **keep these two maps in sync** with the route list in `App.jsx`):

| Path | Page | Sidebar workflow row |
|------|------|---------------------|
| `/` | Workspace | inbox |
| `/pa-draft` | PA Draft Builder | (none yet) |
| `/functional-review` | Functional Review | reviews |
| `/bid-evaluation` | Bid Evaluation | bidding |
| `/award-sign` | Award & Sign | awards |

Catch-all redirects to `/`.

## Design system — non-negotiable rules

The full token table lives in `DESIGN-SYSTEM.md` and is mirrored in `src/styles/tokens.css`. Before touching any visual code, read both. The rules below are the ones that get violated repeatedly:

1. **Light-only main area, always-dark sidebar.** The sidebar darkness is architectural, not a theme. There is no dark/light toggle. `useTheme.js` exists as a hook stub only — do not wire it.
2. **Accent palette is blue/teal, not coral/orange.** Coral is the sibling Chat app (`/app`). Primary `--blue #00A3E0`, deep `--blue-dk #0033A0`, secondary `--teal #00867B`. Never reach for coral here.
3. **Per-card accent stripes.** Each action card has its own `--accent` / `--accent-bg` pair (Draft PA blue-dk, Functional Review teal, Bid Evaluation purple `#643278`, Award & Sign green `#00843D`). These four colors are load-bearing — keep them consistent across Workspace cards, page headers, and any future detail screens.
4. **Tabular numerals on all data.** `font-variant-numeric: tabular-nums` — KPI numbers, currency, dates, counts.
5. **Tight letter-spacing scales with size.** `-0.005em` at body, up to `-0.025em` at h1.
6. **Icons go through `ICO`.** If you need a new glyph, add it to `Icons.jsx` using the `<I/>` factory (`stroke="currentColor"`, 1.8 stroke width). Don't paste raw `<svg>` into pages — the one exception in `PADraft.jsx` is a placeholder pattern, not a precedent.
7. **Placeholder pages use inline styles; real pages use the CSS files.** The four placeholder pages (`PADraft`, etc.) self-contain inline `style` objects with hardcoded accent values. When you build a real version of one of these screens, migrate styles to a dedicated CSS file (mirror `workspace.css` structure) and consume tokens via `var(--…)`.
8. **Truncation always pairs with a tooltip.** Any text that may clip must use `text-overflow: ellipsis` (visible "…") **and** carry the full value as `title={fullText}` on the JSX node. Never hide overflow without ellipsis. Never show an ellipsis without a `title`. Full pattern + per-surface checklist in `DESIGN-SYSTEM.md` → "Truncation & tooltips".
9. **No tracked-caps eyebrows.** No `text-transform: uppercase` with wide `letter-spacing`. Use sentence case with the design-system letter-spacing scale (-0.005em body, -0.012em h3, -0.025em h1, **no positive letter-spacing — 0 or negative only**).
10. **Spacing in a flex/grid row comes from the parent's `gap` only.** Never add `margin` on child items inside a `display: flex` / `display: grid` container — you get double-gap (parent gap + child margin) and the rhythm fails. The fix: parent owns `gap`, children own `margin: 0`. Especially true for section-header icons, chip clusters, and toolbar groups.
11. **No monospace font for identifiers.** PR / PA / contract numbers and other IDs use `var(--font-ui)` with `font-variant-numeric: tabular-nums` + `font-feature-settings: "tnum" 1, "ss01" 1` for digit alignment. **Do not** use `var(--font-mono)` / `Source Code Pro` / `ui-monospace` for visible identifier content. The `.code` styling in `workspace.css` is the canonical ID-chip pattern — copy it.
12. **One table-header style.** All data tables (Inbox, Gates, future tables) share `.tbl th` — same font size, weight, color, padding, background. **Do not** introduce `.tbl-compact th` overrides that change header look; compact mode tightens rows only, not headers.
13. **Label-class minimum font size.** Section headers, group labels, eyebrows, and brand sub-text are **minimum 12px** in sentence case. They used to live at 10px only because they had `text-transform: uppercase` + 0.10em letter-spacing — the tracked-caps treatment made 10px read as a confident label. With rules #9/#11 forbidding that treatment, 10px sentence case reads as microcopy. **Paired rule:** whenever you remove caps/tracking from a label class, bump its `font-size` to ≥12px and its color from `--t4` to `--t3` (or `--t2` for stronger emphasis) so the label still reads as a label. Affected classes already corrected: `.brand .org`, `.group-h`, `.chat-nav .group-h`, `.all-section-h`, `.rail-section h4`.

## UX quality bar

User instruction: **Google Staff UX Designer + Senior Visual Interaction Designer**. This is enforced — every visual or interaction change is held to that bar. Practical implications: dense but legible information design, motion uses `--ease-out` / `--ease-spring` at 160–200ms, elevation stays inside `--el-1`..`--el-4`, never invent ad-hoc shadows, hover/focus/active are all distinct, accessible labels on every interactive element (see `Shell.jsx` topbar for the pattern).

## Conventions worth knowing

- **React 19, function components, hooks only.** No class components, no `React.FC`, plain JSX (not TSX — the project is JS, despite `@types/react` being installed).
- **Routing via `react-router-dom` v7.** Use `useNavigate`, `useLocation`, `<Outlet/>`. Pages navigate to other pages via the `link` field on their data row (see `INBOX_ROWS`, `ACTION_CARDS`).
- **State lives in the component that needs it.** No Redux, no context, no Zustand. `Shell` holds `sideCollapsed` and `activeId` and passes them down. If you need cross-page state, ask before introducing a store.
- **No barrel files.** Import directly from `./components/Shell`, `../data/constants`, etc.
- **CSS class names are kebab-case, BEM-ish without strict modifiers** (`.tab`, `.tab.active`, `.rail-pill`, `.kpi .sub.warn`). Match the surrounding file's vocabulary.

## When extending the app

- **Adding a route**: register in `App.jsx`, add label to `PAGE_LABELS` in `Shell.jsx`, add (if applicable) to `WORKFLOW_ROUTES` in `Sidebar.jsx`.
- **Adding data**: append to `constants.js` with a stable `id` field; pages key off `id`.
- **Building one of the four placeholder pages**: read `DESIGN-SYSTEM.md` (especially the per-card accent stripe for that page) and `Workspace.jsx` for component patterns (sparkline, KPI tile, status chip, avatar stack with overflow, gate row). Reuse — don't reinvent.
- **Adding a sidebar item**: edit `SIDEBAR_NAV` in `constants.js`. Workflow rows need a corresponding `WORKFLOW_ROUTES` entry to highlight on route match.

## Failure modes from prior sessions — do not repeat

Each of these landed in this codebase, was caught by the user, and shipped a fix + rule. Read once.

11. **No "lying" interactive surfaces.** Any element with `cursor: pointer`, `role="button"`, `aria-pressed`, button styling, or hover affordance ships with a real handler. **Never hardcode `className="active"` / `aria-pressed="true"` literals** — always derive from state. If the data layer can't drive it yet, don't render the button.
12. **Typeable inputs minimums.** Real `<input>` / `<textarea>`, not buttons styled like inputs. Font ≥ 13.5px, line-height ≥ 20px, container height ≥ 36px (48px for primary search), `caret-color: var(--aramco-blue)`, placeholder dims on `:focus-within`. Caret must have vertical presence — a 1px caret on 11px line-height is invisible.
13. **Write JSX strings in their final case.** Don't write `"PROCURA · ALL"` in JSX and lower it via CSS `text-transform`. The string is the source of truth; CSS is decoration. Removing the decoration mustn't leave the string stranded.
14. **Grep before naming a CSS class.** Class collisions across files cause cascading bugs (`.stage` clobbered between pipeline and chat). One-liner: `grep -rn "\.your-new-class" src/styles/ src/`. If it exists, namespace yours (`.chat-stage`, not `.stage`).
15. **"Permanently" / "everywhere" / "all" = exhaustive grep.** When the user says any of those words, the completion criterion is `grep -rn pattern src/ | wc -l == 0` (or expected count). Don't fix one occurrence and call it done. After the sweep, run the grep and report the count.
16. **Pair-compare before declaring done.** When changing spacing, alignment, or sizing, compare like-pairs explicitly: icon→title gap vs title→count gap; sibling card heights; row baselines across a grid. Trust the eye only after pair comparison. A passing screenshot is not the same as a pair-compared screenshot.
17. **Boolean state lives in `useState`, derived state lives in render.** Don't store derived values in state (e.g., `pinnedThreads` array). Recompute from source + filter set. This codebase uses `useMemo` for expensive derivations only; cheap filters/maps run inline.
18. **Pills, badges, and any rounded count chip use flex centering — never `text-align: center` + `line-height: Npx`.** Glyph side-bearings differ (`1` and `4` are not symmetric in most UI fonts), so line-height/text-align hits off-center especially under tabular-nums. Pattern: `display: inline-flex; align-items: center; justify-content: center; line-height: 1; padding: 0 6px; box-sizing: border-box; min-width: <pill-height>;` plus `font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1, "lnum" 1`.
19. **Body text inside floating overlays needs weight ≥ 600 AND explicit smoothing.** Tooltips, peek bubbles, popovers — anywhere text sits on a soft-shadow card over a busy background — read as washed-out at weight 500. Use `font-weight: 600`, `-webkit-font-smoothing: antialiased`, and an explicit color (`#0E1320`), not just `var(--t1)`. The eyebrow being readable while the body isn't is the visual tell.
20. **Defer-unmount any animated exit.** When an element leaves the DOM with an animation (Genie, slide, scale), the unmount must wait for the keyframe to finish. Pattern: two booleans (`closing` + `collapsed`), set `closing=true` → `setTimeout(setCollapsed, ANIM_MS)`. Mirror for open (mount first, set `opening=true`, clear after ANIM_MS). Bulk `sed` on state setters is dangerous — it can rewrite the setter inside its own definition and cause infinite recursion. Always pair-grep after a sed sweep.

## Token economy — agent practices

These save tokens without losing rigor. Apply them silently — don't narrate them.

- **Don't re-read a file you just Edited.** Edit/Write only return on success; if the diff shows applied, it applied. The harness tracks file state.
- **Batch lint + build in one Bash call** (`npm run lint && npm run build` or two parallel) — they're always paired after edits.
- **Parallel-call independent reads.** When you need to inspect 3 unrelated files, send 3 Bash/Read calls in one message, not sequential.
- **Stay silent on PostToolUse hook reminders.** The "verifying after batch" acknowledgement is noise — the work happens regardless.
- **Skip end-of-turn echo of tool output.** If you just printed a build log, don't restate the file sizes in your summary.
- **Use sed/grep for bulk text changes**, not Edit one-at-a-time. Removing the same property from 12 selectors is a sed job, not 12 Edits.
- **Don't ask permission for foreseeable next step.** If user says "fix X permanently," the implied steps (sweep + fix + verify + grep-count) don't need a confirmation question.
- **End-of-turn summary is 1–3 sentences.** What changed + what's next + (only if relevant) what's verified. No tables of unchanged items, no recap of what they already saw.

## Verification checklist (run before claiming done on a visual change)

1. `npm run lint && npm run build` — both green.
2. If a rule used "all/everywhere/permanently": `grep -rn <pattern> src/` returns the expected count (usually 0).
3. If spacing/alignment changed: pair-compare adjacent gaps and sibling baselines, in both expanded and collapsed pane states.
4. If interactive: verify the actual handler fires (`preview_click` + state check), not just that the cursor changes.
5. If the change might affect another page: spot-check one other surface that uses the same primitive.

## Wizard-screen pattern (PA Draft canon — apply to every CR transactional screen)

The PA Draft 5-step wizard was iterated to score ~9/10 against PM/UX heuristic. Every CR transactional screen (Functional Review, Bid Slate, Bid Evaluation, Award & Sign, Contract Cockpit) MUST follow the same 9-element pattern. Do not redo these fights per screen.

### 9 mandatory elements per section that contains AI-derived data

1. **AI chip** — small teal pulse-dot pill: `Procura · <verb> Xs ago`. Use `.ai-chip` class. Class verbs: checked / derived / reserved / matched / assembled / suggested / routed / ranked / scored.

2. **Info icon (i)** — `.info-btn` next to section h4. Hover/click reveals 320px dark tooltip with how-this-works copy. Two-sentence max. Explains WHO does it + WHAT triggers it.

3. **Per-item override** — every AI-auto-decided cell/row gets a granular action: Flag (Step 1 style) / Override (Step 2 style) / Replace (Step 4 style) / Change (Step 3 style) / Remove (Schedules style). Never just one bulk "Override" link for a whole section.

4. **View source / View evidence** — every AI conclusion has a "View source" / "View PR field" button → opens `.doc-modal` showing the actual PR snippet Procura cited. Human-in-the-loop verification.

5. **CR action callout** — `.cr-action` blue-left-bar paragraph: `<b>Your action:</b> <one sentence imperative>`. Tells the CR exactly what to do on this screen.

6. **Confirm modal on destructive actions** — use `.confirm-panel` (warn variant for risky). Title + body explaining consequences + Cancel/Confirm. Never destructive without confirm.

7. **Toast on state change** — `.toast` bottom-center pill, auto-dismiss 3–4.5s. Green dot for OK, amber for warn.

8. **Typed editors** — no free-text input for structured values. Use segmented control for enums, radio cards for short enums with explanations, number+suffix for quantities, dropdowns for fixed lists. Free `<input type="text">` only for actual prose (notes, special terms).

9. **Status reacts to overrides** — section header status flips when CR flags/overrides. E.g. `All 4 checks passed · OK to draft` → `2 of 4 flagged · cannot draft`. Continue button disables when blocking issues exist (with tooltip).

### Color rule (locked, do not re-litigate)

**Primary action color is solid `var(--aramco-dark-blue)`.** NO `linear-gradient(135deg, var(--aramco-blue), var(--aramco-dark-blue))` anywhere. User has rejected this 3+ times. Sed-sweep before committing any visual change:
```
grep -rn "linear-gradient(135deg, var(--aramco-blue), var(--aramco-dark-blue))" src/styles/
```
Result must be 0.

### Premium button rule

`.pbtn-premium` = solid `var(--aramco-dark-blue)` bg, 38px height, 10px radius, white text 700/13px, circular arrow chip that translates 3px on hover, brightness press feedback. Disabled state: muted panel bg + not-allowed cursor + hidden ::before/::after. No gradients.

### Per-item override class catalog (reuse, don't reinvent)

| Class | Use case | Visual |
|-------|----------|--------|
| `.rd-flag` | Flag a check as issue | Red-tinted pill, click → inline note input |
| `.tc-override` | Override AI-derived enum value | Red link below cell, click → inline `<select>` |
| `.sched-remove` | Remove auto-included item | ✕ button, click confirms via toast |
| `.rev-replace-btn` | Swap named person | Blue chip, click → inline `<select>` of 3 alternates |
| `.link-btn` | Section-level override (last-resort) | Underlined blue link, opens confirm modal |

### Workflow

When asked to "apply the pattern to <screen>": run the 9-element checklist. If any element missing, that's the fix. Score before/after on the 9 items. Don't ship below 8/9.

### Identity hero (10th element — applies to every transactional screen)

Every CR transactional screen MUST open with a `<PaHero>` from `src/components/WizardKit.jsx`. The hero shows:

- PA code (e.g. `PA-LFPA-0218`) + title in display font
- Meta row: value · track · proponent (+dept) · screen-specific notes
- Right cluster: status chip with `.stage-active` (teal pulse), `Stage N/7` count, 7-segment lifecycle bar with `.is-done` (blue) for past stages + `.is-active` (teal pulse) for current + empty for future, SLA-left meta, View PA + PRS buttons

The 7-stage CR lifecycle is canonical:

| # | Stage | Screen |
|---|-------|--------|
| 1 | Intake | Inbox |
| 2 | PA Draft | `/pa-draft` |
| 3 | Functional Review | `/functional-review` |
| 4 | Bid Slate | `/bid-slate/:id` |
| 5 | Bidding | (wait state) |
| 6 | Bid Evaluation | `/bid-evaluation` |
| 7 | Award & Sign | `/award-sign` |

After hero, optionally add a `wiz-stepper` for sub-step navigation inside the screen (PA Draft has 5 sub-steps; Functional Review has 3 — Endorse · Resolve · Route). Each panel heading gets a `<span class="step-tag">Step N</span>` prefix that ties to the stepper.

Never use a generic `.page-head` block as the first element on a transactional screen. Hero first, always.

### Memory hooks for future agents

- `feedback_pa_draft_pattern.md` (auto-memory) — canonical reference
- `feedback_solid_dark_blue_only.md` (auto-memory) — color lockdown
- This section of CLAUDE.md — full checklist + class catalog
- `src/components/WizardKit.jsx` — `PaHero`, `AiChip`, `InfoIcon`, `CrAction`, `ConfirmModal`, `Toast`, `EvidenceModal`, `makeToaster`

---

## Standing patterns codified from sessions R63–R80

These rules emerged from CR/CPM iteration. Apply on every new transactional screen or change. Do not relitigate.

### Canonical PA status (single source of truth)

All PA status is owned by `src/lib/paStatus.js`. Frozen enum (`PA_STATUS`) + single label map (`STATUS_LABELS`) + tone map (`STATUS_TONE`) + stage map (`STATUS_STAGE`). Backed by `localStorage['cr-app:pa-status:v1']`. **Never invent status strings**. Never use "In <Stage>" or other prefix variants — `STATUS_LABELS` has ONE label per status that renders everywhere identically (Workspace dashboard, Inbox queue, Reviews queue, Bidding queue, Awards queue, PaHero stage chip, header context chip).

When a CR completes a stage (Route to SRC / Issue RFP / Compile packet / Send to SRC), call `setPaStatus(prCode, { status: PA_STATUS.NEXT })`. Every subscriber updates in lockstep — no per-screen status copies.

Lane-level reviewer statuses (Endorsed/Pending/Returned/Blocked inside FR) are SEPARATE from the PA-level status enum. Name them `LANE_STATUS_LABELS` locally — don't confuse the two namespaces.

### Persistent footer (PA Draft `step-foot` pattern)

Every transactional screen ends with a `.step-foot` containing:
- Left: ghost Back button (back to previous step OR previous screen if on step 1)
- Right: secondary action (Save / Export) + `pbtn-premium` Continue (or final-step verb: Route / Issue / Compile / Send)

Disabled state on the premium button when preconditions fail, with explanatory `title`. Never put the primary CTA in the page-head — footer is the single CTA surface.

### Wizard sub-stepper (tab-switch, NOT scroll-to)

Multi-step screens use `.wiz-stepper` with `is-active / is-done / is-next` states. Click a step → `setActiveStep(id)` and **only that step's panel renders below**. Do NOT scroll-to-anchor with all panels visible. Default active step auto-derives from data progress; user click overrides.

No `.wiz-hint` micro-text inside step buttons (caused visual noise; user rejected). Just number bubble + label.

### Step panel chrome (per sub-step)

Each `<div class="panel">` uses `.panel-head` containing:
- `.step-badge.tone-{blue|teal|amber|green}` — 44px filled icon badge (no number overlay — that lives in the stepper)
- `<h3>` plain Title Case title (no UPPERCASE letter-tracking)
- `<AiChip verb="…" ago="…" />` showing AI freshness
- `<InfoIcon>` for "How this works" tooltip
- Right: `chip-pill` with tone (`is-ok / is-warn / is-neutral`) showing count or state

Steps 1 / 2 / 3 must share identical chrome. If Step 3 has a different layout (gate card, summary, etc.), wrap it in the same `.panel` shell so visual uniformity holds.

### Row-action density: 1 primary + ⋯

For any list row (lane, package item, deviation, bidder), the right cluster should be:
- ONE combined `status-chip-combo` (label + SLA folded in via vertical separator)
- ONE primary action button contextual to status (Nudge / Address / Clear / Endorse)
- ONE `.row-menu-btn` (⋯) overflow with everything else (Replace, View source, Withdraw, Flag, etc.)

Never expose 3+ visible buttons per row.

### Group by attention (lane lists, bidder lists)

Long lists of stateful items group into 3 sections:
- **Needs your attention** — amber tint, top, items requiring CR action
- **In progress** — neutral, middle, items waiting on others
- **Endorsed / Done** — collapsed `<details>` block, bottom, dim

Each group header is Title Case (no UPPERCASE tracking), with `chip-pill xs` count on the right and a proper chevron SVG (28×28 hit area) on the collapsible one.

### Decision modals (Address / Confirm-replace / Hand-back)

When the user has 3+ options with materially different consequences, use `EvidenceModal` with `doc.decisionCards[]` (NOT `doc.actions[]`). Each card has:
- `icon` (semantic — `wand` for AI auto-fix, `handBack` for return, `shieldStar` for override)
- `tone: 'primary' | 'warn' | 'neutral'`
- `recommended: true` on the safest/fastest path
- `title` (short verb phrase) + `sub` (1-sentence consequence explanation)
- `onClick`

Footer = Cancel only. Buttons-row pattern (`actions[]`) only for ≤2 mechanical choices.

### Confirm-modal dispatch — verb-based

Only confirm for state-changing verbs: `set`, `apply`, `reject`, `override`, `hand back`, `delete`, `remove`. View verbs (`open`, `view`, `show`, `preview`, `inspect`) navigate directly. Generate / Draft / Send verbs fire inline + toast. Never confirm "Open Schedule" / "View source" / "View progress" — they're navigation, not state changes.

### Gate logic — exclude informational items

When computing a "can proceed" gate (e.g. `canRoute`), only count actionable items. Progress-indicator callouts (ok-tone, like "2/5 lanes endorsed") are display, not gating. Filter them out of the open-count or have them auto-resolve from derived state.

For dynamic text inside callouts that reflect counts (e.g. "2 of 5 endorsed"), render live values — never use static seed strings that go stale when state changes.

### Icon system — semantic + bold-stroke variants

`src/components/Icons.jsx` is the only icon source. When you need a semantic icon, prefer:
- `wand` for AI applies fix
- `handBack` for return/undo
- `shieldStar` for CR override
- `checkBold` / `checkCircle` for affirmation on filled badges (thin `check` looks weak inside tone wells)
- `sparkle` for Procura attribution

Never inline raw `<svg>` in JSX — add a named entry to `Icons.jsx` instead.

### Status chip uniformity (Workspace dashboard inbox table)

`.status-pill` is `white-space: nowrap`, `min-width: 92px`, `justify-content: center`. Columns of chips align vertically. The pill tone maps from canonical `STATUS_TONE[status]` — never invent inline tones.

### Header context strip

Global header left slot is **never** a static `Aramco / CD-PSCM / Page` breadcrumb. It's a page-aware `HeaderContext` (in `Shell.jsx`) that shows:
- On per-PA routes: ACTIVE PA chip (clickable → /pa-draft) + title + tone-dot stage chip
- On queue routes: WORKFLOW + page name + count
- On overview: TODAY + page name + priority count

No `FY / Q` filter chip — killed; useless for CRs. ⌘K kbd hint right-aligned inside the search input.

### Memory hooks (auto-load every conversation)

- `feedback_pa_draft_pattern.md` — 9-element checklist
- `feedback_solid_dark_blue_only.md` — color lockdown
- `feedback_pa_hero_required.md` — PaHero on every transactional screen
- `feedback_canonical_status.md` — single status source of truth
- `feedback_decision_modal_pattern.md` — decision cards for 3+ option flows
- `feedback_one_action_plus_overflow.md` — 1 primary + ⋯ per row

If you see ANY of these patterns violated in code you're about to ship, fix it before opening the PR.
