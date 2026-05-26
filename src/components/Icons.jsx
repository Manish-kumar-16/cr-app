/* ═══════════════════════════════════════════════════════════════════
   CR Flow — SVG Icon System
   Factory pattern: base <I> component + ICO export object.
   ═══════════════════════════════════════════════════════════════════ */

const I = ({ d, size = 16, sw = 1.8, fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const ICO = {
  /* ── Navigation / Chrome ──────────────────────────────────────── */
  bell: (p) => (
    <I {...p} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />
  ),
  chat: (p) => (
    <I {...p} d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />
  ),
  create: (p) => (
    <I {...p} d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>} />
  ),
  ideate: (p) => (
    <I {...p} d={<><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /><path d="M10 21h4" /></>} />
  ),
  plus: (p) => (
    <I {...p} d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />
  ),
  folder: (p) => (
    <I {...p} d={<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />} />
  ),
  book: (p) => (
    <I {...p} d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} />
  ),
  settings: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />
  ),
  more: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>} />
  ),
  pin: (p) => (
    <I {...p} d={<><path d="M12 17v5" /><path d="M9 2h6l-1 7h4l-6 8-6-8h4L9 2z" /></>} />
  ),

  /* ── Input / Communication ────────────────────────────────────── */
  attach: (p) => (
    <I {...p} d={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />} />
  ),
  mic: (p) => (
    <I {...p} d={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>} />
  ),
  send: (p) => (
    <I {...p} d={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
  ),
  chevD: (p) => (
    <I {...p} d={<polyline points="6 9 12 15 18 9" />} />
  ),
  chevL: (p) => (
    <I {...p} d={<polyline points="15 18 9 12 15 6" />} />
  ),
  chevR: (p) => (
    <I {...p} d={<polyline points="9 18 15 12 9 6" />} />
  ),

  /* ── Domain / Workflow ────────────────────────────────────────── */
  doc: (p) => (
    <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>} />
  ),
  calc: (p) => (
    <I {...p} d={<><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="16" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="8" y2="18" /><line x1="12" y1="18" x2="16" y2="18" /></>} />
  ),
  layers: (p) => (
    <I {...p} d={<><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>} />
  ),
  shield: (p) => (
    <I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} />
  ),
  users: (p) => (
    <I {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
  ),
  flow: (p) => (
    <I {...p} d={<><polyline points="14 2 14 8 20 8" /><path d="M20 8v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></>} />
  ),
  share: (p) => (
    <I {...p} d={<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>} />
  ),
  pkg: (p) => (
    <I {...p} d={<><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} />
  ),
  wrench: (p) => (
    <I {...p} d={<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />} />
  ),
  cube: (p) => (
    <I {...p} d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} />
  ),

  /* ── Status / Utility ─────────────────────────────────────────── */
  clock: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />
  ),
  check: (p) => (
    <I {...p} d={<polyline points="20 6 9 17 4 12" />} />
  ),
  /* Bold check — heavier stroke + slight stylization for premium contexts */
  checkBold: (p) => (
    <I {...p} sw={2.4} d={<polyline points="20 6.5 9 17.5 4 12.5" />} />
  ),
  /* Check inside a circle — for decision cards / success states */
  checkCircle: (p) => (
    <I {...p} sw={2} d={<><circle cx="12" cy="12" r="10" /><polyline points="16 9 11 14.5 8 12" /></>} />
  ),
  /* Wand + sparkles — semantic for "AI auto-applies the fix" */
  wand: (p) => (
    <I {...p} sw={2} d={<>
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8L19 13" />
      <path d="M17.8 6.2L19 5" />
      <path d="M12.2 6.2L11 5" />
      <path d="M3 21l9-9" />
    </>} />
  ),
  /* Hand-back / undo — bent arrow returning */
  handBack: (p) => (
    <I {...p} sw={2} d={<>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </>} />
  ),
  /* Medal — winner / lead candidate */
  medal: (p) => (
    <I {...p} sw={1.8} d={<>
      <circle cx="12" cy="14" r="6" />
      <path d="M8.5 13.2 6 3h4l2 4" />
      <path d="M15.5 13.2 18 3h-4l-2 4" />
      <circle cx="12" cy="14" r="2.5" fill="currentColor" stroke="none" />
    </>} />
  ),
  /* Shield with a star — CR authority / override */
  shieldStar: (p) => (
    <I {...p} sw={2} d={<>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polygon points="12 9 13 11.2 15.2 11.4 13.6 13 14 15.2 12 14.1 10 15.2 10.4 13 8.8 11.4 11 11.2 12 9" />
    </>} />
  ),
  filter: (p) => (
    <I {...p} d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />} />
  ),
  dl: (p) => (
    <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />
  ),
  stats: (p) => (
    <I {...p} d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />
  ),
  sparkle: (p) => (
    <I {...p} d={<><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></>} />
  ),
  lock: (p) => (
    <I {...p} d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} />
  ),
  arrowL: (p) => (
    <I {...p} d={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />
  ),
  arrowR: (p) => (
    <I {...p} d={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />
  ),
  arrowUp: (p) => (
    <I {...p} d={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />
  ),

  /* ── Calendar / Info / Misc ───────────────────────────────────── */
  cal: (p) => (
    <I {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />
  ),
  info: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>} />
  ),
  clipboard: (p) => (
    <I {...p} d={<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>} />
  ),
  paper: (p) => (
    <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>} />
  ),
  sun: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>} />
  ),
  moon: (p) => (
    <I {...p} d={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />} />
  ),
  logout: (p) => (
    <I {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>} />
  ),

  /* ── CR-specific ──────────────────────────────────────────────── */
  inbox: (p) => (
    <I {...p} d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>} />
  ),
  award: (p) => (
    <I {...p} d={<><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>} />
  ),
  review: (p) => (
    <I {...p} d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>} />
  ),
  chart: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10h-10V2z" /></>} />
  ),
  grid: (p) => (
    <I {...p} d={<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>} />
  ),
  search: (p) => (
    <I {...p} d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
  ),
  export: (p) => (
    <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>} />
  ),
  download: (p) => (
    <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />
  ),
  play: (p) => (
    <I {...p} d={<polygon points="5 3 19 12 5 21 5 3" />} />
  ),
  x: (p) => (
    <I {...p} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
  ),
  template: (p) => (
    <I {...p} d={<><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>} />
  ),
  clauses: (p) => (
    <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></>} />
  ),
  help: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>} />
  ),
  user: (p) => (
    <I {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
  ),
  eye: (p) => (
    <I {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>} />
  ),
  eyeOff: (p) => (
    <I {...p} d={<><path d="M2 2l20 20" /><path d="M6.7 6.7C4.3 8.5 2 12 2 12s3.5 7 10 7c2 0 3.7-.5 5.2-1.3" /><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" /><path d="M14.1 14.1A3 3 0 0 0 12 9c-.4 0-.7 0-1 .2" /></>} />
  ),
  globe: (p) => (
    <I {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>} />
  ),
  shieldCheck: (p) => (
    <I {...p} d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>} />
  ),
};

/* Pre-render all icons as JSX elements so {ICO.xxx} works directly */
const RENDERED = Object.fromEntries(
  Object.entries(ICO).map(([k, fn]) => [k, fn()])
);

export { I, RENDERED as ICO };
export default RENDERED;
