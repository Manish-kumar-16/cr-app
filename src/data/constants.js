/* ═══════════════════════════════════════════════════════════════════
   CR Flow — Static Data Constants
   All mock / reference data for the CR workspace.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Sidebar Navigation ─────────────────────────────────────────── */
export const SIDEBAR_NAV = {
  workflow: [
    { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 4, badgeType: 'crit' },
    { id: 'reviews', label: 'Reviews', icon: 'review', badge: 3 },
    { id: 'bidding', label: 'Bidding', icon: 'layers', badge: 5 },
    { id: 'awards', label: 'Awards & Sign', icon: 'award', badge: 1 },
  ],
  library: [
    { id: 'templates', label: 'Templates', icon: 'doc' },
    { id: 'vendors', label: 'Vendors & Bidders', icon: 'users' },
    { id: 'clauses', label: 'Clauses', icon: 'filter' },
  ],
  insights: [
    { id: 'insights', label: 'Procura insights', icon: 'sparkle', badge: 4, badgeType: 'crit' },
    { id: 'activity', label: 'Activity log', icon: 'clock' },
  ],
  system: [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'help', label: 'Help & shortcuts', icon: 'info' },
  ],
};

/* ── Pinned Contracts ───────────────────────────────────────────── */
export const PINNED_CONTRACTS = [
  { id: 'p1', title: 'LFPA · MP-IK-LSTK · Jubail Hookup', link: '/pa-draft' },
  { id: 'p2', title: 'LFPA · GCS · ERP Advisory Bench', link: '/pa-draft' },
];

/* ── Bidding Contracts ──────────────────────────────────────────── */
export const BIDDING_CONTRACTS = [
  { id: 'b1', title: 'CM-IK-RC · Khurais OffPlot Civil', link: '/bid-evaluation' },
  { id: 'b2', title: 'MP-IK-LSPB · NPS Compressor Replace', link: '/bid-evaluation' },
  { id: 'b3', title: 'GCS · Risk Advisory Panel 2026', link: '/bid-evaluation' },
];

/* ── Recent Contracts ───────────────────────────────────────────── */
export const RECENT_CONTRACTS = [
  { id: 'r1', title: 'LFPA · CM-IK-RC · Tanajib Tank Farm', link: '/bid-evaluation' },
  { id: 'r2', title: 'MP-IK-LSTK · Berri GOSP Tie-In', link: '/award-sign' },
  { id: 'r3', title: 'GCS · Engineering Services Pool', link: '/award-sign' },
];

/* ── KPI Data ───────────────────────────────────────────────────── */
export const KPI_DATA = [
  { id: 'assigned', label: 'Assigned', value: 4, sub: '+2 since yesterday',    subType: 'up',   color: '#00A3E0', spark: [18, 17, 16, 14, 11, 8, 5],  trend: { dir: 'up',   pct: '+18%' }, link: '/' },
  { id: 'drafts',   label: 'Drafts',   value: 7, sub: 'avg cycle 14d',         subType: 'neu',  color: '#5E6878', spark: [12, 10, 13, 11, 12, 10, 11], trend: { dir: 'flat', pct: '0%'   }, link: '/pa-draft' },
  { id: 'awaiting', label: 'Awaiting', value: 3, sub: '1 overdue · Law',       subType: 'warn', color: '#C99504', spark: [17, 16, 15, 12, 14, 11, 10], trend: { dir: 'down', pct: '−4%'  }, link: '/functional-review' },
  { id: 'bidding',  label: 'Bidding',  value: 5, sub: 'next close 2d · Jubail',subType: 'neu',  color: '#0072A8', spark: [9, 11, 10, 9, 11, 9, 9],    trend: { dir: 'up',   pct: '+2'   }, link: '/bid-evaluation' },
  { id: 'award',    label: 'Award',    value: 1, sub: 'SRC ready · $68.4M',    subType: 'up',   color: '#4F7400', spark: [16, 16, 15, 16, 15, 16, 16], trend: { dir: 'up',   pct: '+1'   }, link: '/award-sign' },
];

/* ── Action Cards ───────────────────────────────────────────────── */
export const ACTION_CARDS = [
  {
    id: 'draft',
    title: 'Draft new PA',
    subtitle: 'Template · schedules · clauses',
    cta: 'Start draft',
    link: '/pa-draft',
    accent: '#0033A0',
    accentBg: 'rgba(0,51,160,0.07)',
    icon: 'doc',
    info: 'Convert PR to draft Procurement Agreement — apply template, attach schedules, and stage clauses for review.',
    aging: { dot: 'fresh',  meta: 'Last run · 12m' },
  },
  {
    id: 'review',
    title: 'Functional review',
    subtitle: 'Law · CP&CCD · SMPCAD',
    cta: 'Open tracker',
    link: '/functional-review',
    accent: '#00867B',
    accentBg: 'rgba(0,134,123,0.07)',
    icon: 'review',
    info: 'Track concurrence lanes across Law, CP&CCD, SMPCAD, and Technical until Endorsed for Signature.',
    aging: { dot: 'aging', meta: 'Last run · 2h' },
  },
  {
    id: 'bid',
    title: 'Bid evaluation',
    subtitle: 'BRT · IRT · Commercial vs CE',
    cta: 'Open console',
    link: '/bid-evaluation',
    accent: '#643278',
    accentBg: 'rgba(100,50,120,0.07)',
    icon: 'chart',
    info: 'Evaluate Technical, IKTVA, and Commercial bids — flag offers exceeding Cost Estimate by 5%.',
    aging: { dot: 'fresh', meta: 'Last run · 38m' },
  },
  {
    id: 'award',
    title: 'Award & sign',
    subtitle: 'SRC route · sign PA · notify',
    cta: 'Build award',
    link: '/award-sign',
    accent: '#00843D',
    accentBg: 'rgba(0,132,61,0.07)',
    icon: 'award',
    info: 'Compile award recommendation, route awards ≥ $50M to SRC, sign the PA, and notify stakeholders.',
    aging: { dot: 'stale', meta: 'Last run · 1d' },
  },
];

/* ── Pipeline Stages ────────────────────────────────────────────── */
export const PIPELINE_STAGES = [
  { id: 'inbox',    phase: 'P3',  name: 'Inbox',    count: 4, sla: '0.5d', urgent: 1, value: '$184M' },
  { id: 'pa-draft', phase: 'P4a', name: 'PA Draft', count: 7, sla: '6d',  avatars: ['MG', 'FN'], overflow: 5, value: '$612M' },
  { id: 'review',   phase: 'P4a', name: 'Review',   count: 3, sla: '4d',  urgent: 1, value: '$94M'  },
  { id: 'solicit',  phase: 'P4b', name: 'Solicit',  count: 2, sla: '3d',  avatars: ['SO', 'YK'], value: '$48M'  },
  { id: 'bidding',  phase: 'P4b', name: 'Bidding',  count: 5, sla: '21d', avatars: ['RS', 'HB'], overflow: 3, value: '$220M' },
  { id: 'evaluate', phase: 'P4c', name: 'Evaluate', count: 5, sla: '9d',  avatars: ['AA', 'YK'], overflow: 3, value: '$176M' },
  { id: 'award',    phase: 'P4c', name: 'Award',    count: 2, sla: '3d',  avatars: ['MG', 'AA'], value: '$112M' },
];

/* ── Inbox Table Rows ───────────────────────────────────────────── */
export const INBOX_ROWS = [
  {
    id: 'pr1',
    code: 'PR-2026-04481',
    title: 'Jubail Hookup & Commissioning · Phase 3',
    type: 'MP-IK-LSTK',
    typeClass: 'mp',
    proponent: 'Ahmed Al-Mahmoud',
    dept: 'D&CE',
    avatar: 'AA',
    value: '$68.4M',
    risk: 'hi',
    riskLabel: 'Hi · SRC',
    status: 'New',
    statusType: 'info',
    link: '/pa-draft',
  },
  {
    id: 'pr2',
    code: 'PR-2026-04476',
    title: 'ERP Advisory Bench · 2-yr rolling',
    type: 'GCS',
    typeClass: 'gcs',
    proponent: 'Faisal Al-Nasser',
    dept: 'IT&DS',
    avatar: 'FN',
    value: '$11.2M',
    risk: 'md',
    riskLabel: 'Med',
    status: 'New',
    statusType: 'info',
    link: '/pa-draft',
  },
  {
    id: 'pr3',
    code: 'PR-2026-04471',
    title: 'Khurais OffPlot Civil Works',
    type: 'CM-IK-RC',
    typeClass: 'cm',
    proponent: 'Salem Al-Otaibi',
    dept: 'NAPD',
    avatar: 'SO',
    value: '$32.8M',
    risk: 'md',
    riskLabel: 'Med',
    status: 'Draft',
    statusType: 'neutral',
    link: '/pa-draft',
  },
  {
    id: 'pr4',
    code: 'PR-2026-04458',
    title: 'NPS Compressor Replacement · 4 units',
    type: 'MP-IK-LSPB',
    typeClass: 'mp',
    proponent: 'Hatem Al-Balawi',
    dept: 'GO&PD',
    avatar: 'HB',
    value: '$94.6M',
    risk: 'hi',
    riskLabel: 'Hi · SRC',
    status: 'In Review',
    statusType: 'warning',
    link: '/functional-review',
  },
  {
    id: 'pr5',
    code: 'PR-2026-04449',
    title: 'Risk Advisory Panel · 2026 cycle',
    type: 'GCS',
    typeClass: 'gcs',
    proponent: 'Reem Al-Shehri',
    dept: 'CFO Office',
    avatar: 'RS',
    value: '$4.7M',
    risk: 'lo',
    riskLabel: 'Low',
    status: 'Bidding',
    statusType: 'info',
    link: '/bid-evaluation',
  },
  {
    id: 'pr6',
    code: 'PR-2026-04432',
    title: 'Tanajib Tank Farm · Civil + M&E',
    type: 'CM-IK-RC',
    typeClass: 'cm',
    proponent: 'Yousef Al-Khaldi',
    dept: 'NAPD',
    avatar: 'YK',
    value: '$58.1M',
    risk: 'hi',
    riskLabel: 'Hi · SRC',
    status: 'Evaluation',
    statusType: 'info',
    link: '/bid-evaluation',
  },
];

/* ── Gates Pending ──────────────────────────────────────────────── */
export const GATES_PENDING = [
  { id: 'g1', gate: 'Endorsed for Signature', code: 'PA-LFPA-0241', name: 'Jubail Hookup',        time: '12m ago', actionType: 'approve', link: '/functional-review', assignee: 'MG' },
  { id: 'g2', gate: 'Bid Slate Approval',     code: 'PA-LFPA-0237', name: 'NPS Compressor',       time: '1h ago',  actionType: 'src',     link: '/award-sign',        assignee: 'AA' },
  { id: 'g3', gate: 'CE +5% Negotiation',     code: 'PA-LFPA-0218', name: 'Tanajib Tank Farm',    time: '3h ago',  actionType: 'ghost',   link: '/bid-evaluation',    assignee: 'YK' },
  { id: 'g4', gate: 'IKTVA Revision Round 2', code: 'PA-LFPA-0211', name: 'Khurais Civil',        time: '5h ago',  actionType: 'ghost',   link: '/bid-evaluation',    assignee: 'SO' },
];

/* ── Chat quick prompts (Procura) ───────────────────────────────── */
export const CHIPS = [
  { id: 'pa',    label: 'Draft a new PA',              desc: 'Generate Purchase Agreement from template',  ico: 'doc',     acc: 'acc-b',  route: '/pa-draft' },
  { id: 'iktva', label: 'Check IKTVA on a bid',        desc: 'Validate In-Kingdom score vs target',         ico: 'shield',  acc: 'acc-g',  route: '/bid-evaluation' },
  { id: 'src',   label: 'Trace SRC routing',           desc: 'Approval path ≥ $50M · CE +5% rule',          ico: 'flow',    acc: 'acc-pu', route: '/award-sign' },
  { id: 'ce',    label: 'Build a Company Estimate',    desc: 'CE from contract history + benchmarks',       ico: 'calc',    acc: 'acc-t'  },
  { id: 'slate', label: 'Review bid slate criteria',   desc: 'Saudization, OOK, ownership filters',         ico: 'users',   acc: 'acc-aw', route: '/bid-slate/PA-LFPA-0241' },
  { id: 'clz',   label: 'Suggest clause language',     desc: 'Schedule B / C / D clauses by category',      ico: 'layers',  acc: 'acc-b'  },
];

/* ── Chat threads (Procura sidebar — chat mode) ─────────────────── */
/* Categories: pa (Purchase Agreement) · bid · award · iktva · src · scope */
export const CHAT_THREADS = [
  { id: 'c1', title: 'Jubail Hookup · LFPA draft review', snippet: 'Procura · drafted Section 6 clauses',  cat: 'pa',    pinned: true,  unread: 0, model: 'Metabrain', time: '2d',        ts: -2 * 86400 },
  { id: 'c2', title: 'GCS Advisory Bench · IKTVA path',   snippet: 'You · "any way to lift to 70%?"',      cat: 'iktva', pinned: true,  unread: 2, model: 'Metabrain', time: '4d',        ts: -4 * 86400 },
  { id: 'c3', title: 'Khurais OffPlot · CE +5% check',    snippet: 'CE drift +6.8% vs history',            cat: 'bid',   pinned: false, unread: 1, model: 'Metabrain', time: '12m',       ts: -12 * 60 },
  { id: 'c4', title: 'Berri GOSP · SRC routing',          snippet: '≥ $50M path · 3 approvers',            cat: 'src',   pinned: false, unread: 0, model: 'Metabrain', time: '2h',        ts: -2 * 3600 },
  { id: 'c5', title: 'Tanajib Tank Farm · slate audit',   snippet: 'OOK overlap flagged on B2 & B4',       cat: 'bid',   pinned: false, unread: 3, model: 'Metabrain', time: '5h',        ts: -5 * 3600 },
  { id: 'c6', title: 'NPS Compressor · BRT pack',         snippet: 'Drafted commercial vs confidential',   cat: 'bid',   pinned: false, unread: 0, model: 'Metabrain', time: 'Yesterday', ts: -1 * 86400 },
  { id: 'c7', title: 'Risk Advisory Panel 2026',          snippet: 'Saudization scenarios drafted',        cat: 'scope', pinned: false, unread: 0, model: 'Metabrain', time: '2d',        ts: -2 * 86400 - 3600 },
  { id: 'c8', title: 'ERP Advisory Bench · scope memo',   snippet: 'You · scope split between 2 & 3',      cat: 'scope', pinned: false, unread: 0, model: 'Metabrain', time: '3d',        ts: -3 * 86400 },
  { id: 'c9', title: 'Hawiyah Gas Plant · award memo',    snippet: 'Award recommendation drafted',         cat: 'award', pinned: false, unread: 0, model: 'Metabrain', time: '4d',        ts: -4 * 86400 },
  { id: 'c10', title: 'Ras Tanura T-9 · BRT findings',    snippet: 'Procura · 4 risk items raised',        cat: 'bid',   pinned: false, unread: 0, model: 'Metabrain', time: '1w',        ts: -7 * 86400 },
  { id: 'c11', title: 'Manifa LSTK · escalation note',    snippet: 'Schedule slip 14d · root cause',       cat: 'pa',    pinned: false, unread: 0, model: 'Metabrain', time: '1w',        ts: -8 * 86400 },
  { id: 'c12', title: 'Shaybah CP&CCD · clause refresh',  snippet: 'You · need 2026 Saudization weights',  cat: 'pa',    pinned: false, unread: 0, model: 'Metabrain', time: '2w',        ts: -14 * 86400 },
];

/* Category metadata — accent colour, label, icon key */
export const CHAT_CAT = {
  pa:    { label: 'PA',    color: '#0033A0', ico: 'doc' },
  bid:   { label: 'Bid',   color: '#643278', ico: 'layers' },
  award: { label: 'Award', color: '#00843D', ico: 'award' },
  iktva: { label: 'IKTVA', color: '#00867B', ico: 'shield' },
  src:   { label: 'SRC',   color: '#0072A8', ico: 'flow' },
  scope: { label: 'Scope', color: '#9A6700', ico: 'filter' },
};

/* ── Activity Feed ──────────────────────────────────────────────── */
export const ACTIVITY_FEED = [
  { id: 'a1', actor: 'Hessa Al-Subaie · Law', action: 'concurred on', target: 'PA-LFPA-0241', detail: 'standard clauses validated, OOK slate reviewed.', time: '14m', icon: 'check' },
  { id: 'a2', actor: 'You', action: 'issued Addendum #03 to all 6 bidders on', target: 'PA-LFPA-0218', detail: 'JEM clarification on noise spec.', time: '1h', icon: 'send' },
  { id: 'a3', actor: 'Procura', action: 'flagged', target: 'PA-LFPA-0237', detail: 'common-ownership 56% between Bidder 2 and 4. Resolve before slate approval.', time: '2h', icon: 'sparkle' },
  { id: 'a4', actor: 'SRC', action: 'approved Award Recommendation on', target: 'PA-LFPA-0205', detail: 'Berri GOSP Tie-In · $48.2M to ZahidEng.', time: 'Yesterday', icon: 'check' },
  { id: 'a5', actor: 'BOC', action: 'opened bids for', target: 'PA-LFPA-0218', detail: '6 bidders · 3 envelopes each (Tech / Comm / IKTVA).', time: 'Yesterday', icon: 'cal' },
];

/* ─────────────────────────────────────────────────────────────────
   PA DRAFT — Template selection + schedules + strategy
   ───────────────────────────────────────────────────────────────── */
export const PA_HEADER = {
  pr: 'PR-2026-04481',
  title: 'Jubail Hookup & Commissioning — Phase 3',
  value: '$68.4M',
  track: 'LFPA · SRC route',
  proponent: 'Ahmed Al-Mahmoud',
  dept: 'D&CE',
  schedule: 'Schedule B v3',
  notes: 'CE sealed · PRS attached · IKTVA 52% · Saudization 35% Ops',
};

export const PA_RECO = {
  pick: 'MP-IK-LSTK',
  rationale: 'Major Project, In-Kingdom, Lump-Sum Turnkey — matches PR scope, value, and IKTVA tier.',
};

export const PA_TEMPLATES = [
  { id: 'MP-IK-LSTK', name: 'Standard Agreement Template', sub: 'Major Project · In-Kingdom · Lump-Sum Turnkey', schedules: 'B · C · S/H · G', reviewers: 'Law · CP&CCD · Tech', recommended: true },
  { id: 'MP-IK-LSPB', name: 'Lump-Sum Procure & Build', sub: 'Major Project · In-Kingdom · LSPB', note: 'Schedule C lists materials ≥ $1M. Use when Aramco needs material visibility.', schedules: 'B · C (itemised) · S/H · G', reviewers: 'Law · CP&CCD · Tech' },
  { id: 'CM-IK-RC', name: 'Construction Management — Reimbursable', sub: 'CM · In-Kingdom · Reimbursable', note: 'Use Schedules A + C + F together. CM-style oversight contract.', schedules: 'A · C · F · S/H', reviewers: 'Law · CP&CCD · SMPCAD · Tech' },
  { id: 'GCS', name: 'General Consulting Services', sub: 'GCS Advisory Bench', note: 'Schedule C = all-inclusive daily rate (+ overtime).', schedules: 'B · C (daily) · S/H', reviewers: 'Law · CP&CCD' },
  { id: 'MP-OK-RC', name: 'Major Project — Out-of-Kingdom', sub: 'MP · OOK · Reimbursable', note: 'Schedule B may be non-standard. Triggers Law Org OOK slate review.', schedules: 'B (non-std) · C · S/H', reviewers: 'Law (OOK) · CP&CCD · Tech' },
  { id: 'TA-EA-TTA', name: 'Technology License Agreement', sub: 'EA + TTA bundle', note: 'Concurrent Engineering + Technology Transfer.', schedules: 'Custom', reviewers: 'Law · CP&CCD · Tech' },
];

export const PA_SCHEDULES = [
  { id: 'B', name: 'Scope of Work', source: 'From PR', status: 'auto' },
  { id: 'C', name: 'Commercial Pricing', source: 'Lump Sum', status: 'auto' },
  { id: 'S', name: 'Saudization', source: '35% Ops', status: 'auto' },
  { id: 'SM', name: 'Saudization (SM)', source: 'SM-level', status: 'auto' },
  { id: 'G', name: 'Major Projects', source: 'LSTK', status: 'auto' },
];

export const PA_STRATEGY = [
  { id: 'br', label: 'Bidder reach', value: 'IKTVA ≥ 65% · 8 vendors', tone: 'b' },
  { id: 'ce', label: 'CE strategy', value: 'Seal + open after BRT', tone: 't' },
  { id: 'ws', label: 'Window', value: '14 days RFP + 7 Q&A', tone: 'b' },
  { id: 'sz', label: 'Saudization floor', value: '35% Ops · 12% SM', tone: 'g' },
];

/* ─────────────────────────────────────────────────────────────────
   FUNCTIONAL REVIEW — concurrence lanes
   ───────────────────────────────────────────────────────────────── */
export const FR_HEADER = {
  pa: 'PA-LFPA-0218',
  title: 'Jubail Hookup & Commissioning — Phase 3',
  stage: 'Functional Review · §4.2',
  value: '$68.4M',
  ce: '$60.2M sealed',
};

export const FR_LANES = [
  { id: 'law', name: 'Law', who: 'F. Al-Nasser', status: 'endorsed', sla: '2h', notes: 'Clauses 8.2, 14.1 amended per OOK exception.', risk: null },
  { id: 'cpccd', name: 'CP&CCD', who: 'S. Bin-Saleh', status: 'pending', sla: '1d', notes: 'Awaiting CE sensitivity acknowledgement.', risk: 'med' },
  { id: 'tech', name: 'Tech / D&CE', who: 'A. Al-Mahmoud', status: 'endorsed', sla: '4h', notes: 'Schedule B & spec list aligned with PR.', risk: null },
  { id: 'iktva', name: 'IKTVA', who: 'M. Al-Otaibi', status: 'returned', sla: 'overdue', notes: 'Saudization (SM) clause needs 12% floor — currently 9%.', risk: 'hi' },
  { id: 'smpcad', name: 'SMPCAD', who: 'K. Al-Faraj', status: 'pending', sla: '2d', notes: 'Materials list (Schedule C) under check.', risk: null },
];

export const FR_CALLOUTS = [
  { id: 'c1', tone: 'warn', t: 'IKTVA Saudization (SM) below floor', d: 'Set Schedule S/SM to 12% minimum before re-routing.', action: 'Open Schedule S/SM' },
  { id: 'c2', tone: 'info', t: 'CE sensitivity acknowledgement pending', d: 'CP&CCD requires signed CE-sensitivity NDA. Auto-draft ready.', action: 'Generate NDA' },
  { id: 'c3', tone: 'ok', t: '2 of 5 lanes endorsed', d: 'Law & Tech complete. 3 to go before SRC route.', action: 'View progress' },
];

/* ─────────────────────────────────────────────────────────────────
   BID EVALUATION — composite ranking, BRT/IRT, CE comparison
   ───────────────────────────────────────────────────────────────── */
export const BE_HEADER = {
  pa: 'PA-LFPA-0218',
  title: 'Jubail Hookup & Commissioning — Phase 3',
  bidders: 6,
  envelopes: '3 opened',
  ce: 60.2,
  ceLabel: '$60.2M sealed',
};

export const BE_BIDDERS = [
  { id: 'B1', name: 'ZahidEng JV', score: 92, tech: 96, iktva: 84, comm: 62.4, dev: '+3.7%', status: 'lead', flags: [] },
  { id: 'B2', name: 'Al-Yamamah Steel', score: 88, tech: 90, iktva: 78, comm: 64.1, dev: '+6.5%', status: 'ok', flags: ['CE +5%'] },
  { id: 'B3', name: 'NPCC KSA', score: 85, tech: 88, iktva: 81, comm: 65.7, dev: '+9.1%', status: 'review', flags: ['CE +5%'] },
  { id: 'B4', name: 'Saipem Taqa', score: 83, tech: 92, iktva: 64, comm: 63.2, dev: '+5.0%', status: 'review', flags: ['IKTVA low', 'OOK 56%'] },
  { id: 'B5', name: 'Sinopec MEC', score: 76, tech: 85, iktva: 58, comm: 61.9, dev: '+2.8%', status: 'low', flags: ['IKTVA low'] },
  { id: 'B6', name: 'JGC Gulf', score: 72, tech: 84, iktva: 55, comm: 68.0, dev: '+13.0%', status: 'low', flags: ['CE high'] },
];

export const BE_CALLOUTS = [
  { tone: 'warn', t: 'Lowest bid exceeds CE by ≥5%', d: 'Negotiation permitted without SRC approval. CE +5% memo template ready.', action: 'Draft CE +5% memo' },
  { tone: 'info', t: 'OOK overlap flagged', d: 'B4 shares 56% beneficial ownership with B2. Resolve before composite ranking.', action: 'Open ownership matrix' },
];

/* ─────────────────────────────────────────────────────────────────
   AWARD & SIGN — winner, package, SRC route
   ───────────────────────────────────────────────────────────────── */
export const AS_HEADER = {
  pa: 'PA-LFPA-0218',
  title: 'Jubail Hookup & Commissioning — Phase 3',
  winner: 'ZahidEng JV',
  bidderId: 'B1',
  value: '$62.4M',
  saving: '$5.6M vs highest bid',
  stage: 'Award Recommendation · §6.2',
  tech: 96,
  iktva: 84,
  composite: 92,
  dev: '+3.7%',
  start: '15 Jul 2026',
  durationMonths: 36,
};

export const AS_PACKAGE = [
  { id: 'p1', label: 'Composite ranking signed', kind: 'inherited', source: 'Bid Evaluation', done: true },
  { id: 'p2', label: 'BRT technical pass attached', kind: 'inherited', source: 'BRT verdict', done: true },
  { id: 'p3', label: 'IRT IKTVA review attached', kind: 'inherited', source: 'IRT IKTVA review', done: true },
  { id: 'p4', label: 'CE +5% memo (N/A)', kind: 'inherited', source: '§5.4.10', done: true },
  { id: 'p5', label: 'OOK overlap resolution memo', kind: 'inherited', source: '§5.4.13', done: true },
  { id: 'p6', label: 'Notification of Award (NoA)', kind: 'cr-action', source: 'NoA template', done: false, est: '2 min' },
  { id: 'p7', label: 'Unsuccessful-bidder letters', kind: 'cr-action', source: 'Letter template · 5 letters', done: false, est: '3 min' },
];

export const AS_ROUTE = [
  { id: 'r1', who: 'BOC chair',     role: 'Sajid R. · Bid Opening Committee', initials: 'SR', step: 'Review composite',         when: 'Today 14:30',   sla: 'Done', state: 'done' },
  { id: 'r2', who: 'CD Manager',    role: 'Khalid A. · Contracts Manager',    initials: 'KA', step: 'Endorse award memo',       when: 'Today 16:00',   sla: 'Done', state: 'done' },
  { id: 'r3', who: 'SRC Secretary', role: 'Noura A. · SRC Secretariat',       initials: 'NA', step: 'Compile SRC packet',       when: 'Tomorrow 09:00', sla: '18h', state: 'now' },
  { id: 'r4', who: 'SRC',           role: 'Senior Review Committee',          initials: 'SRC', step: 'Approve award',           when: '+2 business days', sla: '48h', state: 'next' },
  { id: 'r5', who: 'You',           role: 'Mohammed Al-Ghamdi · CD-PSCM',     initials: 'MG', step: 'Issue NoA · notify losers', when: 'On approval',   sla: 'Final',state: 'next' },
];

/* ─────────────────────────────────────────────────────────────────
   CONTRACT COCKPIT — drilled-down PA snapshot
   ───────────────────────────────────────────────────────────────── */
export const CC_HEADER = {
  pa: 'PA-LFPA-0205',
  title: 'Berri GOSP Tie-In',
  vendor: 'ZahidEng',
  value: '$48.2M',
  start: '2025-11-04',
  end: '2027-03-15',
  status: 'In execution · 38% complete',
};

export const CC_KPIS = [
  { label: 'SES Approvals', value: '18 / 24', sub: '4 awaiting CR action', tone: 'b' },
  { label: 'Variation Orders', value: '3 active', sub: '$1.4M cumulative', tone: 't' },
  { label: 'IKTVA Compliance', value: '67%', sub: 'Target 65% · met', tone: 'g' },
  { label: 'Performance Score', value: '4.6 / 5', sub: 'Q2 evaluation', tone: 'b' },
];

export const CC_GATES = [
  { id: 'g1', label: 'Award & sign', date: '2025-11-04', done: true },
  { id: 'g2', label: 'Mob & site setup', date: '2025-12-12', done: true },
  { id: 'g3', label: 'Pre-commissioning', date: '2026-08-30', done: false, active: true },
  { id: 'g4', label: 'Commissioning', date: '2026-11-15', done: false },
  { id: 'g5', label: 'PAC handover', date: '2027-01-25', done: false },
  { id: 'g6', label: 'Close-out', date: '2027-03-15', done: false },
];

export const CC_DEVIATIONS = [
  { id: 'd1', when: '2026-03-12', what: 'VO #3 — additional cathodic protection', amt: '$520K', state: 'approved' },
  { id: 'd2', when: '2026-04-02', what: 'Schedule slip 14 days — long-lead valve', amt: '—', state: 'tracking' },
  { id: 'd3', when: '2026-05-10', what: 'IKTVA Q1 self-cert overdue', amt: '—', state: 'open' },
];

/* ─────────────────────────────────────────────────────────────────
   BID SLATE / RFP — vendor pool, selected slate, package, distribution
   ───────────────────────────────────────────────────────────────── */
export const BS_HEADER = {
  pa: 'PA-LFPA-0241',
  title: 'Khurais Off-Plot · slate seed',
  due: 'Issue by 2026-05-30',
  windowDays: 14,
};

export const BS_POOL = [
  { id: 'v1', name: 'ZahidEng JV', iktva: 72, ook: 0, prior: 4, perf: 4.7, slated: true },
  { id: 'v2', name: 'Al-Yamamah Steel', iktva: 68, ook: 0, prior: 6, perf: 4.4, slated: true },
  { id: 'v3', name: 'NPCC KSA', iktva: 81, ook: 0, prior: 3, perf: 4.5, slated: true },
  { id: 'v4', name: 'Saipem Taqa', iktva: 64, ook: 56, prior: 2, perf: 4.2, slated: true, flag: 'OOK 56%' },
  { id: 'v5', name: 'Sinopec MEC', iktva: 58, ook: 0, prior: 1, perf: 4.0, slated: true, flag: 'IKTVA low' },
  { id: 'v6', name: 'JGC Gulf', iktva: 65, ook: 0, prior: 2, perf: 4.3, slated: true },
  { id: 'v7', name: 'Petrofac IK', iktva: 70, ook: 0, prior: 5, perf: 4.5, slated: false },
  { id: 'v8', name: 'Worley Arabia', iktva: 76, ook: 0, prior: 8, perf: 4.8, slated: false },
];

export const BS_PACKAGE = [
  { id: 'p1', label: 'PA template (MP-IK-LSTK)', done: true },
  { id: 'p2', label: 'Schedule B · Scope of Work', done: true },
  { id: 'p3', label: 'Schedule C · Pricing format', done: true },
  { id: 'p4', label: 'Schedule S/H · Saudization & Safety', done: true },
  { id: 'p5', label: 'Schedule G · Major Project terms', done: true },
  { id: 'p6', label: 'IKTVA Reporting Pack', done: false },
  { id: 'p7', label: 'Pre-bid Q&A window (7 days)', done: false },
];

/* ─────────────────────────────────────────────────────────────────
   LIBRARY · Templates
   ───────────────────────────────────────────────────────────────── */
export const TEMPLATES_DATA = [
  { id: 't1',  category: 'PA',         code: 'LFPA-MP-IK-LSTK', name: 'Lump-Sum Turnkey · MP · IK',     description: 'Major Project, In-Kingdom, Lump-Sum Turnkey contracting template.',         lastUpdated: '12 Apr 2026', owner: 'CD-PSCM Standards', usage: 42, mandatory: true,  status: 'current',  schedules: ['B','C','S','H','G','I','J'] },
  { id: 't2',  category: 'PA',         code: 'LFPA-MP-IK-LSPB', name: 'Lump-Sum Pricing Book · MP · IK', description: 'Major Project In-Kingdom with unit-rate pricing book.',                       lastUpdated: '08 Apr 2026', owner: 'CD-PSCM Standards', usage: 18, mandatory: false, status: 'current',  schedules: ['B','C','S','H','G'] },
  { id: 't3',  category: 'PA',         code: 'LFPA-CM-IK-RC',   name: 'Cost-Reimbursable · CM · IK',     description: 'Construction-Management track, In-Kingdom, Cost-Reimbursable.',                lastUpdated: '01 Feb 2026', owner: 'CD-PSCM Standards', usage: 9,  mandatory: false, status: 'current',  schedules: ['B','C','S','H'] },
  { id: 't4',  category: 'PA',         code: 'GCS-AdvBench',    name: 'GCS Advisory Bench',              description: 'General Consulting Services bench engagement template.',                       lastUpdated: '20 Mar 2026', owner: 'CD-PSCM Standards', usage: 24, mandatory: false, status: 'current',  schedules: ['B','C'] },
  { id: 't5',  category: 'Award',      code: 'NoA',             name: 'Notification of Award',            description: 'NoA letter — fills winner identity, value, mobilisation date.',               lastUpdated: '14 Apr 2026', owner: 'Contracts',         usage: 67, mandatory: true,  status: 'current',  schedules: [] },
  { id: 't6',  category: 'Award',      code: 'UBL',             name: 'Unsuccessful-Bidder Letter',       description: 'Reason-coded letter for non-winning bidders.',                                 lastUpdated: '14 Apr 2026', owner: 'Contracts',         usage: 156,mandatory: true,  status: 'current',  schedules: [] },
  { id: 't7',  category: 'Memo',       code: 'CE5',             name: 'CE +5% Memo',                      description: '§5.4.10 — required when low bid exceeds Cost Estimate by 5% or more.',         lastUpdated: '05 Jan 2026', owner: 'Cost Engineering',  usage: 14, mandatory: false, status: 'current',  schedules: [] },
  { id: 't8',  category: 'Memo',       code: 'OOK',             name: 'OOK Overlap Resolution Memo',      description: '§5.4.13 — resolves bidder ownership overlap before composite ranking.',        lastUpdated: '11 Mar 2026', owner: 'CD-PSCM Standards', usage: 6,  mandatory: false, status: 'current',  schedules: [] },
  { id: 't9',  category: 'Schedule',   code: 'SchB',            name: 'Schedule B · Scope of Work',       description: 'Detailed scope of work schedule.',                                              lastUpdated: '02 Apr 2026', owner: 'Engineering',       usage: 88, mandatory: true,  status: 'current',  schedules: [] },
  { id: 't10', category: 'Schedule',   code: 'SchC',            name: 'Schedule C · Pricing',             description: 'Pricing schedule template (lump-sum / unit-rate).',                            lastUpdated: '02 Apr 2026', owner: 'Cost Engineering',  usage: 88, mandatory: true,  status: 'current',  schedules: [] },
  { id: 't11', category: 'RFP',        code: 'RFP-Std',         name: 'Standard RFP Package',             description: 'Pre-bid Q&A timeline + slate cover + Schedule B/C bundling.',                  lastUpdated: '15 Mar 2026', owner: 'CD-PSCM',           usage: 31, mandatory: false, status: 'current',  schedules: [] },
  { id: 't12', category: 'Schedule',   code: 'SchH',            name: 'Schedule H · Safety',              description: 'HSE plan + Saudization commitment template.',                                  lastUpdated: '28 Feb 2026', owner: 'Loss Prevention',   usage: 71, mandatory: true,  status: 'current',  schedules: [] },
];

/* ─────────────────────────────────────────────────────────────────
   LIBRARY · Vendors & Bidders
   ───────────────────────────────────────────────────────────────── */
export const VENDORS_DATA = [
  { id: 'v1',  code: 'ZEJV', name: 'ZahidEng JV',         country: 'KSA',     iktva: 84, performance: 4.6, activeContracts: 3, lastContract: '15 Jul 2026', ownership: 'In-Kingdom', tier: 'preferred',  notes: 'Lead candidate · PA-LFPA-0218' },
  { id: 'v2',  code: 'JGCG', name: 'JGC Gulf',            country: 'UAE/JP',  iktva: 62, performance: 4.2, activeContracts: 2, lastContract: '03 Feb 2026', ownership: 'OOK',         tier: 'active',     notes: '' },
  { id: 'v3',  code: 'SBMS', name: 'Saudi Binladin MEP',  country: 'KSA',     iktva: 78, performance: 3.9, activeContracts: 5, lastContract: '22 May 2026', ownership: 'In-Kingdom', tier: 'preferred',  notes: '' },
  { id: 'v4',  code: 'TECN', name: 'Técnicas Reunidas',   country: 'ES',      iktva: 55, performance: 4.4, activeContracts: 1, lastContract: '11 Sep 2025', ownership: 'OOK',         tier: 'active',     notes: '' },
  { id: 'v5',  code: 'CCCQ', name: 'CCC Qatar',           country: 'QA',      iktva: 64, performance: 3.5, activeContracts: 0, lastContract: '18 Aug 2024', ownership: 'OOK',         tier: 'watchlist',  notes: 'IKTVA below 65% floor on last 2 bids' },
  { id: 'v6',  code: 'NESM', name: 'NESMA & Partners',    country: 'KSA',     iktva: 81, performance: 4.5, activeContracts: 4, lastContract: '02 Jun 2026', ownership: 'In-Kingdom', tier: 'preferred',  notes: '' },
  { id: 'v7',  code: 'PETF', name: 'Petrofac Saudi',      country: 'KSA/UK',  iktva: 70, performance: 4.0, activeContracts: 2, lastContract: '17 Apr 2026', ownership: 'In-Kingdom', tier: 'active',     notes: '' },
  { id: 'v8',  code: 'WORL', name: 'Worley Saudi',        country: 'KSA',     iktva: 77, performance: 4.3, activeContracts: 6, lastContract: '08 May 2026', ownership: 'In-Kingdom', tier: 'preferred',  notes: 'GCS bench partner' },
  { id: 'v9',  code: 'SAIM', name: 'SAIPEM',              country: 'IT',      iktva: 50, performance: 3.8, activeContracts: 0, lastContract: '24 Jan 2025', ownership: 'OOK',         tier: 'watchlist',  notes: 'Schedule slip on last engagement' },
  { id: 'v10', code: 'SBJV', name: 'Saudi Binladin · JGC JV', country: 'KSA·JP', iktva: 72, performance: 4.1, activeContracts: 1, lastContract: '01 Mar 2026', ownership: 'JV',         tier: 'active',     notes: '' },
  { id: 'v11', code: 'KENT', name: 'Kentech Saudi',       country: 'KSA',     iktva: 68, performance: 3.7, activeContracts: 2, lastContract: '12 Feb 2026', ownership: 'In-Kingdom', tier: 'active',     notes: '' },
  { id: 'v12', code: 'AMEC', name: 'AMEC Foster Wheeler', country: 'UK',      iktva: 48, performance: 3.6, activeContracts: 0, lastContract: '15 Oct 2024', ownership: 'OOK',         tier: 'watchlist',  notes: 'IKTVA gap · re-evaluate' },
];

/* ─────────────────────────────────────────────────────────────────
   LIBRARY · Clauses
   ───────────────────────────────────────────────────────────────── */
export const CLAUSES_DATA = [
  { id: 'c1',  ref: '§5.4.10',  category: 'Commercial', title: 'CE +5% memo trigger',                  summary: 'Memo required when low bid exceeds Cost Estimate by 5% or more.',          mandatory: true,  lastReviewed: '14 Apr 2026', usageCount: 47, owner: 'Cost Engineering' },
  { id: 'c2',  ref: '§5.4.13',  category: 'Commercial', title: 'Ownership overlap resolution',         summary: 'Common-ownership bidders must be flagged and resolved pre-composite.',     mandatory: true,  lastReviewed: '11 Mar 2026', usageCount: 12, owner: 'CD-PSCM Standards' },
  { id: 'c3',  ref: '§6.2',     category: 'Commercial', title: 'Award recommendation method',          summary: 'Composite weighting 50% Tech · 25% IKTVA · 25% Commercial.',               mandatory: true,  lastReviewed: '02 Feb 2026', usageCount: 156, owner: 'CD-PSCM Standards' },
  { id: 'c4',  ref: '§4.1.2',   category: 'IKTVA',      title: 'IKTVA floor (65%)',                    summary: 'In-Kingdom value content of bidder must meet or exceed 65% for MP track.',  mandatory: true,  lastReviewed: '20 Mar 2026', usageCount: 88, owner: 'IRT' },
  { id: 'c5',  ref: '§4.2',     category: 'IKTVA',      title: 'Saudization commitment',               summary: 'Minimum Saudization percentage by contract value tier.',                    mandatory: true,  lastReviewed: '01 Apr 2026', usageCount: 71, owner: 'HR Saudization' },
  { id: 'c6',  ref: '§3.7.4',   category: 'Legal',      title: 'Liquidated damages',                   summary: 'Standard LD schedule for milestone slip — capped at 10% of contract value.', mandatory: false, lastReviewed: '15 Feb 2026', usageCount: 38, owner: 'Legal · Contracts' },
  { id: 'c7',  ref: '§3.8.1',   category: 'Legal',      title: 'Force majeure',                        summary: 'Force-majeure carve-outs, notification window, mitigation duty.',            mandatory: true,  lastReviewed: '15 Feb 2026', usageCount: 167, owner: 'Legal · Contracts' },
  { id: 'c8',  ref: '§3.5.2',   category: 'Legal',      title: 'Confidentiality',                      summary: 'Three-tier confidentiality regime with carve-out for regulatory disclosure.', mandatory: true,  lastReviewed: '04 Jan 2026', usageCount: 167, owner: 'Legal · Contracts' },
  { id: 'c9',  ref: 'Sch B §2', category: 'Schedule B', title: 'Scope freeze checkpoint',              summary: 'Scope locked at end of pre-bid Q&A window; changes require change-order.',  mandatory: true,  lastReviewed: '02 Apr 2026', usageCount: 88, owner: 'Engineering' },
  { id: 'c10', ref: 'Sch C §3', category: 'Schedule C', title: 'Pricing format',                       summary: 'Unit-rate or lump-sum per discipline; escalation index per Schedule C-2.',    mandatory: true,  lastReviewed: '02 Apr 2026', usageCount: 88, owner: 'Cost Engineering' },
  { id: 'c11', ref: '§5.6',     category: 'Commercial', title: 'Bid validity period',                  summary: 'Bids valid 90 days from bid open; extension by written addendum.',          mandatory: true,  lastReviewed: '08 Mar 2026', usageCount: 56, owner: 'CD-PSCM' },
  { id: 'c12', ref: '§7.1.3',   category: 'Legal',      title: 'Termination for convenience',          summary: 'Owner right to terminate with 30-day notice; demobilisation cost reimbursable.', mandatory: false, lastReviewed: '20 Jan 2026', usageCount: 22, owner: 'Legal · Contracts' },
];

/* ─────────────────────────────────────────────────────────────────
   INSIGHTS · Procura insights
   ───────────────────────────────────────────────────────────────── */
export const INSIGHTS_DATA = [
  { id: 'i1', state: 'new',     priority: 'high',   confidence: 92, icon: 'flag',     title: 'IKTVA floor risk on Bid Eval PA-0218',         evidence: '2 of 7 bidders below 65% IKTVA floor (CCCQ 64% · AMEC 48%). Composite may need re-rank if either is shortlisted.',                  value: 'Avoid §5.4.13 re-work · save ~3 days',     action: 'Open Bid Eval', actionLink: '/bid-evaluation', age: '12m', tags: ['Bid Eval', 'IKTVA'] },
  { id: 'i2', state: 'new',     priority: 'high',   confidence: 88, icon: 'clock',    title: 'CD Manager endorsement SLA at risk · 3 PAs',  evidence: 'PA-0218, PA-0205, PA-0190 all sitting in CD Manager queue >18h. Standard SLA is 24h. CR action: nudge or reroute.',                value: 'Prevent 1d slip across pipeline',          action: 'Open SRC route',  actionLink: '/award-sign',     age: '34m', tags: ['Award & Sign', 'SLA'] },
  { id: 'i3', state: 'new',     priority: 'medium', confidence: 95, icon: 'stats',    title: 'CE band tightening on Khurais OffPlot',       evidence: 'Latest 3 bids cluster +6% to +9% vs CE. CE itself last updated 9 months ago. Re-baseline recommended before slate issuance.', value: 'Higher-quality slate · fewer CE memos',    action: 'Open Bidding',    actionLink: '/bidding',        age: '2h',  tags: ['Bidding', 'CE'] },
  { id: 'i4', state: 'new',     priority: 'medium', confidence: 80, icon: 'users',    title: 'NESMA performance trending up',                evidence: 'Last 4 closed contracts averaged 4.6/5. Consider pre-qualification expansion to 2 more Major Project tracks.',                  value: 'More qualified competition · price tension',action: 'Open Vendors',   actionLink: '/vendors',        age: '6h',  tags: ['Vendors'] },
  { id: 'i5', state: 'acted',   priority: 'medium', confidence: 90, icon: 'shield',   title: 'OOK overlap on Khurais — resolved',           evidence: 'B2/B4 common-ownership flag closed by §5.4.13 memo · B4 disqualified.',                                                          value: 'Closed before composite',                  action: 'View memo',       actionLink: '/bid-evaluation', age: '1d',  tags: ['Bid Eval', 'Resolved'] },
  { id: 'i6', state: 'acted',   priority: 'low',    confidence: 75, icon: 'doc',      title: 'NoA template auto-fill working as expected',  evidence: 'Last 12 NoAs generated needed no edit before CD Manager sign-off. Template is stable.',                                          value: 'No action needed',                         action: 'View template',   actionLink: '/templates',      age: '2d',  tags: ['Templates'] },
  { id: 'i7', state: 'dismissed', priority: 'low',  confidence: 60, icon: 'pin',      title: 'Pinning JGC Gulf to watchlist',                evidence: 'IKTVA below 65% on 2 of last 3 bids.',                                                                                            value: 'Optional — already tracked in Vendors',    action: 'Open Vendors',    actionLink: '/vendors',        age: '4d',  tags: ['Vendors'] },
];

/* ─────────────────────────────────────────────────────────────────
   INSIGHTS · Activity log
   ───────────────────────────────────────────────────────────────── */
export const ACTIVITY_LOG = [
  { id: 'a1',  when: 'Today · 16:00', actor: 'You',             action: 'endorsed',     object: 'PA-LFPA-0218 award memo', context: 'CD Manager queue · Khalid A.',     pa: 'PA-LFPA-0218', kind: 'award',    link: '/award-sign' },
  { id: 'a2',  when: 'Today · 14:30', actor: 'BOC chair',       action: 'signed off',   object: 'composite ranking',         context: 'PA-LFPA-0218 · Bid Evaluation',    pa: 'PA-LFPA-0218', kind: 'evaluation', link: '/bid-evaluation' },
  { id: 'a3',  when: 'Today · 12:08', actor: 'You',             action: 'shortlisted',  object: 'ZahidEng JV as winner',     context: 'PA-LFPA-0218 · Bid Evaluation',    pa: 'PA-LFPA-0218', kind: 'evaluation', link: '/bid-evaluation' },
  { id: 'a4',  when: 'Today · 11:20', actor: 'Procura',         action: 'flagged',      object: 'OOK overlap B2/B4',         context: 'PA-LFPA-0218 · §5.4.13',           pa: 'PA-LFPA-0218', kind: 'insight',  link: '/bid-evaluation' },
  { id: 'a5',  when: 'Today · 09:40', actor: 'You',             action: 'issued',       object: 'RFP package',               context: 'PA-LFPA-0190 · Khurais OffPlot',    pa: 'PA-LFPA-0190', kind: 'rfp',      link: '/bidding' },
  { id: 'a6',  when: 'Yesterday',     actor: 'IRT',             action: 'verified',     object: 'IKTVA 84% for ZahidEng JV', context: 'PA-LFPA-0218 · Functional Review', pa: 'PA-LFPA-0218', kind: 'review',   link: '/functional-review' },
  { id: 'a7',  when: 'Yesterday',     actor: 'You',             action: 'routed',       object: 'PA-LFPA-0205 to BOC',       context: 'Award & Sign',                      pa: 'PA-LFPA-0205', kind: 'award',    link: '/award-sign' },
  { id: 'a8',  when: '2 days ago',    actor: 'Sajid R.',        action: 'opened',       object: 'BRT review',                context: 'PA-LFPA-0218 · 47 spec items',     pa: 'PA-LFPA-0218', kind: 'review',   link: '/functional-review' },
  { id: 'a9',  when: '2 days ago',    actor: 'Procura',         action: 'auto-filled',  object: 'PA Draft Schedule B/C',     context: 'PA-LFPA-0205',                     pa: 'PA-LFPA-0205', kind: 'draft',    link: '/pa-draft' },
  { id: 'a10', when: '3 days ago',    actor: 'You',             action: 'replaced',     object: 'BRT reviewer Ahmad → Saleh', context: 'PA-LFPA-0218 · Functional Review', pa: 'PA-LFPA-0218', kind: 'review',   link: '/functional-review' },
  { id: 'a11', when: '4 days ago',    actor: 'You',             action: 'created',      object: 'PA Draft from PR-2026-04481', context: 'PA-LFPA-0218',                    pa: 'PA-LFPA-0218', kind: 'draft',    link: '/pa-draft' },
  { id: 'a12', when: '5 days ago',    actor: 'CD Manager',      action: 'endorsed',     object: 'PA-LFPA-0190 strategy',     context: 'Bid Slate · Khurais',              pa: 'PA-LFPA-0190', kind: 'review',   link: '/bid-slate' },
  { id: 'a13', when: '1 week ago',    actor: 'You',             action: 'completed',    object: 'PA-LFPA-0177 award',        context: 'Berri GOSP Tie-In',                pa: 'PA-LFPA-0177', kind: 'award',    link: '/contract/PA-LFPA-0177' },
  { id: 'a14', when: '1 week ago',    actor: 'Procura',         action: 'recommended',  object: 'NESMA pre-qual expansion',  context: 'Vendors',                          pa: '—',             kind: 'insight',  link: '/insights' },
];
