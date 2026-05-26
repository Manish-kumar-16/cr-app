# CR Flow App — Design System & Build Plan

**v2 · 2026 Premium refresh.** Aligned with Aramco approved palette (`/Users/manishkumar/Development/Iprocurement/design-system/colors_and_type.css`). Canonical token names are `--fg-*` / `--bg-*` / `--border-*` / `--func-*` / `--space-*` / `--t-*` / `--radius-*` / `--shadow-*`. Legacy `--t1..--t5`, `--hair*`, `--ink-*` survive as aliases for backward compatibility — re-scoped per surface (sidebar dark / main light) via cascade in `shell.css`.

## Persona
**Mohammed Al-Ghamdi** · Contract Representative · CD-PSCM
AI assistant: **Procura**

## Typography (2026)
- **Display** — Outfit (var(--font-display)). KPI numerals, page h1, pipeline counts.
- **Brand** — Fira Sans (var(--font-brand)). Card titles, section headings, rail-pill primary text.
- **UI** — Inter (var(--font-ui)). Body, chrome, controls, badges, table cells.
- **Mono** — Source Code Pro (var(--font-mono)). Code cells, kbd pills.
- Loaded from Google Fonts CDN at top of tokens.css.

## Color System (Light Only)

### Sidebar (always dark — architectural choice, not theme)
| Token | Value | Usage |
|-------|-------|-------|
| --bg | #0c1220 | App background behind sidebar |
| --side | #0f1729 | Sidebar top gradient |
| --side-deep | #0a1120 | Sidebar bottom gradient |
| --hair | rgba(255,255,255,0.07) | Sidebar dividers |
| --hair-2 | rgba(255,255,255,0.12) | Stronger sidebar borders |
| --t1 (sidebar) | #e8edf5 | Primary text |
| --t2 (sidebar) | #b6bfd0 | Secondary text |
| --t3 (sidebar) | #7b8598 | Muted text |
| --t4 (sidebar) | #555f73 | Quiet text |
| --t5 (sidebar) | #3a4459 | Disabled text |

### Main Area (light)
| Token | Value | Usage |
|-------|-------|-------|
| --t1 | #0E1320 | Headlines, primary text |
| --t2 | #2C3548 | Body text |
| --t3 | #5E6878 | Secondary / label text |
| --t4 | #8A94A5 | Muted / placeholder |
| --t5 | #C2CAD7 | Disabled / quiet |
| --hair | #E8EBF1 | Borders, dividers |
| --hair-2 | #DADEE7 | Stronger borders |
| bg | #F7F8FA | Canvas background |
| surface | #FFFFFF | Cards, inputs |

### Accent Palette (NOT coral/orange — this is blue/teal)
| Token | Value | Usage |
|-------|-------|-------|
| --blue | #00A3E0 | Primary action, links, active states |
| --blue-dk | #0033A0 | Deep blue — headings, chip text, active borders |
| --teal | #00867B | Secondary accent — functional review, success-alt |
| --green | #84BD00 | Success states, on-track indicators |
| --amber | #FFAA04 | Warnings, watch items |
| --red | #FF5645 | Errors, overdue, critical |
| --src | #7C5CFC | SRC routing badge (purple) |

### Card-specific accent stripes (action cards)
| Card | --accent | --accent-bg |
|------|----------|-------------|
| Draft PA | #0033A0 | rgba(0,51,160,0.07) |
| Functional Review | #00867B | rgba(0,134,123,0.07) |
| Bid Evaluation | #643278 | rgba(100,50,120,0.07) |
| Award & Sign | #00843D | rgba(0,132,61,0.07) |

### Elevation Tokens (Linear-grade)
| Token | Value |
|-------|-------|
| --el-1 | 0 1px 2px rgba(15,23,42,0.04) |
| --el-2 | 0 1px 2px rgba(15,23,42,0.04), 0 1px 1px rgba(15,23,42,0.02) |
| --el-3 | 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08) |
| --el-4 | 0 1px 2px rgba(15,23,42,0.04), 0 24px 60px -20px rgba(15,23,42,0.18) |

### Motion
| Token | Value | Pattern |
|-------|-------|---------|
| --ease-out | cubic-bezier(0.16, 1, 0.3, 1) | Default transitions |
| --ease-spring | cubic-bezier(0.22, 1.4, 0.36, 1) | Bounce/overshoot |
| Duration | 160ms–200ms | Micro-interactions |

## Typography
- System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Tabular numerals on all data: `font-variant-numeric: tabular-nums`
- Letter-spacing: -0.005em to -0.025em (tighter at larger sizes)
- Sizes: 10px labels → 11px chips → 12px body → 13px nav → 14px → 21px h1

## Architecture

```
cr-app/src/
├── App.jsx              # BrowserRouter + routes
├── main.jsx             # Entry point
├── assets/              # Logos
├── components/
│   ├── Icons.jsx         # SVG icon system (ICO object)
│   ├── Shell.jsx         # Layout: sidebar + main + Outlet
│   └── Sidebar.jsx       # CR-specific nav with workflow sections
├── data/
│   └── constants.js      # Static data (KPIs, sidebar items, table rows)
├── hooks/
│   └── useTheme.js       # Minimal (light only, but keeps hook pattern)
├── pages/
│   ├── Workspace.jsx     # Dashboard: KPIs, action cards, pipeline, inbox
│   ├── PADraft.jsx        # Placeholder — PA Draft Builder
│   ├── FunctionalReview.jsx # Placeholder — Review tracker
│   ├── BidEvaluation.jsx  # Placeholder — Bid console
│   └── AwardSign.jsx      # Placeholder — Award builder
└── styles/
    ├── tokens.css         # Design tokens (this doc as CSS)
    ├── shell.css          # Sidebar + topbar + layout
    └── workspace.css      # Dashboard-specific styles
```

## Routing
| Path | Page | Topbar context |
|------|------|---------------|
| / | Workspace | Create / Workspace |
| /pa-draft | PA Draft | Create / PA Draft Builder |
| /functional-review | Functional Review | Create / Functional Review |
| /bid-evaluation | Bid Evaluation | Create / Bid Evaluation |
| /award-sign | Award & Sign | Create / Award & Sign |

## Key Differences from Chat App (`/app`)

| Aspect | Chat App | CR App |
|--------|----------|--------|
| Primary accent | Coral #E85D3A | Blue #00A3E0 |
| Secondary accent | Orange #F4884A | Teal #00867B |
| Deep accent | Indigo #2B2670 | Deep blue #0033A0 |
| Theme | Dark default + light toggle | Light only |
| Sidebar tabs | Chat / Create / Ideate | Inbox / Reviews / Bidding |
| Persona | Ahmed Al-Mahmoud | Mohammed Al-Ghamdi |
| AI panel | Procura (right rail) | Procura (right rail placeholder) |
| Content | Conversational AI | Workflow dashboard |

## Parallel Build Agents

| Agent | Responsibility | Files |
|-------|---------------|-------|
| 1: Foundation | tokens.css, Icons.jsx, constants.js, App.jsx, main.jsx | 5 files |
| 2: Shell + Sidebar | Shell.jsx, Sidebar.jsx | 2 files |
| 3: Workspace Page | Workspace.jsx (KPIs, cards, pipeline, inbox) | 1 file |
| 4: CSS | shell.css, workspace.css | 2 files |
| 5: Placeholder Pages | PADraft, FunctionalReview, BidEvaluation, AwardSign | 4 files |


---

## Truncation & tooltips (rule)

**Rule (non-negotiable):** any text that can be clipped must:
1. Clip with a **visible ellipsis** (`text-overflow: ellipsis; overflow: hidden; white-space: nowrap`), and
2. Carry the **full value as a native `title=` tooltip** so the user can always recover it on hover.

Never hide overflow without an ellipsis. Never show an ellipsis without a `title`.

### CSS pattern

```css
.truncate {
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

For multi-line clamp (e.g. action card subtitles), use `-webkit-line-clamp: N` with `display: -webkit-box; overflow: hidden`. In that case, the parent cell must still carry `title={fullText}`.

### JSX pattern

Every clippable cell or label:

```jsx
<td className="proponent">
  <span className="title truncate" title={row.proponent}>
    {row.proponent}
  </span>
</td>
```

Table cells inside `.tbl` already inherit ellipsis from `.tbl td .title, .tbl td .meta` rules. The author's only job there is to pass `title={…}` on the JSX node that holds the long text. **Cells with multi-part content** (e.g. "Proponent · Department") set `title` to the joined string.

### Where it applies in this codebase

| Surface | Clippable fields | Owner |
|---|---|---|
| Inbox (`.tbl`) | PR/Title, Proponent (name · dept), Type chip | `Workspace.jsx` |
| Gates pending | Gate name, Contract id, Contract title, Owner avatar (initials → full name) | `Workspace.jsx` |
| Pipeline stages | Stage name (already truncated), stage value | `Workspace.jsx` |
| Sidebar threads | Thread title, snippet | `Sidebar.jsx` |
| All-conversations modal | Thread title, snippet | `ChatAllModal.jsx` |
| Activity feed | Actor name, target id | `Workspace.jsx` |

### What this prevents

- "Faisal Al-Nasser · IT8…" with no way to see the full department.
- "PA-LFPA-0…" with the rest of the number lost.
- Inconsistent UX where some cells ellipsis-clip and others hard-clip.

This rule is enforced in code review. If you add a new clippable cell, the PR description must call out the `title=` attribute alongside the ellipsis CSS.

## Brand mark — canonical presence pattern

The 3D iP hexagon and the Procura orb share one rendering treatment. Use it on every surface above 40px:

```css
.brand-mark {                                           /* container */
  background: transparent;                              /* no frame */
  border: none;
  overflow: visible;                                    /* shadows leak */
  filter:
    drop-shadow(0 8px 22px rgba(0,163,224,0.50))        /* aramco blue */
    drop-shadow(0 14px 44px rgba(0,134,123,0.32));      /* aramco teal */
  animation: brandFloat 6s ease-in-out infinite;        /* ±2-3px breathing */
}
.brand-mark img {
  width: 100%; height: 100%;
  object-fit: contain;                                  /* never cover */
}
@keyframes brandFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
```

Where applied: sidebar header (60×56), login brand block (124×124), Procura rail head (44×44), floating FAB (72×72). Below 32px (collapsed nav icons, favicon at 16/32px) the pattern is static — no shadow, no animation — to preserve legibility at small sizes.

### Asset rule

Logo PNGs must arrive **tight-cropped**: the actual mark fills at least 85% of the bounding box on both axes. If a delivery has built-in whitespace, crop the source asset (`sips --cropToHeightWidth`) before adjusting any CSS. CSS `object-fit` cannot recover the whitespace ratio — the rendered mark stays smaller than its container.

## Pills, badges, count chips — flex-center, never line-height

Any rounded count chip uses flex centering, not `text-align: center` + `line-height: Npx`. Glyph side-bearings differ (`1` and `4` aren't symmetric in most UI fonts), so line-height/text-align hits visibly off-center under tabular-nums.

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  line-height: 1;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
}
```

## Overlay body text — weight ≥ 600 + explicit smoothing

Tooltips, peek bubbles, popovers — anywhere text sits on a soft-shadow card over a busy background — read as washed-out at weight 500. Always:

```css
.overlay-body {
  font-weight: 600;
  color: #0E1320;                          /* explicit, not var(--t1) */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

The eyebrow rendering crisp while the body reads faded is the visual tell that this rule is needed.

## Animated exits — defer the unmount

Any element leaving the DOM with an animation (Genie, slide, scale, fade) must defer its unmount until the keyframe finishes. Pattern:

```jsx
const ANIM_MS = 380;
const close = () => {
  setClosing(true);
  setTimeout(() => { setVisible(false); setClosing(false); }, ANIM_MS);
};
```

Mirror for open: mount first, set `opening: true`, clear after `ANIM_MS`. Pass the animation class via prop (`animClass={closing ? 'genie-out' : opening ? 'genie-in' : ''}`).

**Sed danger:** when bulk-replacing state setters with these handlers, the setter inside its own definition can be rewritten — causing infinite recursion. Always grep after a sed sweep.
