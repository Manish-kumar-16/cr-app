import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ICO } from '../components/Icons';
import {
  PA_HEADER, PA_RECO, PA_TEMPLATES, PA_SCHEDULES,
} from '../data/constants';

/* PA Draft wizard steps — `ico` + `tone` drive the per-step badge
   in the step-card-head, matching the FR step-badge pattern. */
const PA_STEPS = [
  { id: 'template',  label: 'Set up the agreement', short: 'Setup',     ico: 'doc',     tone: 'blue'  },
  { id: 'schedules', label: 'Confirm schedules',    short: 'Schedules', ico: 'paper',   tone: 'teal'  },
  { id: 'strategy',  label: 'Set strategy',         short: 'Strategy',  ico: 'sparkle', tone: 'blue'  },
  { id: 'reviewers', label: 'Assign reviewers',     short: 'Reviewers', ico: 'users',   tone: 'teal'  },
  { id: 'finalize',  label: 'Generate & route',     short: 'Generate',  ico: 'checkBold', tone: 'green' },
];

/* PR readiness checklist — what the CR verifies before drafting */
const READINESS = [
  { id: 'scope',    label: 'Scope of work is clear',          ok: true,  note: 'Schedule B can be auto-built from PR.', evidenceId: 'pr-scope' },
  { id: 'specs',    label: 'Technical specs attached',         ok: true,  note: 'P-ID rev 7 · PFD rev 3 · MTO v2.',     evidenceId: 'pr-specs' },
  { id: 'ce',       label: 'Company Estimate sealed',          ok: true,  note: '$60.2M sealed by Cost Engineering.',   evidenceId: 'pr-ce' },
  { id: 'iktva',    label: 'IKTVA & Saudization targets set',  ok: true,  note: 'IKTVA 52% · Sau 35% Ops · 12% SM.',    evidenceId: 'pr-iktva' },
];

/* Contract track auto-detected from PR attributes */
const TRACK = [
  { id: 'agreement', label: 'Agreement type', value: 'LFPA',         basis: 'Long-Form PA · value ≥ $50M',  evidenceId: 'tr-value' },
  { id: 'route',     label: 'Approval route', value: 'SRC required', basis: 'Value $68.4M ≥ SRC threshold', evidenceId: 'tr-value' },
  { id: 'location',  label: 'Delivery',       value: 'In-Kingdom',   basis: 'PR scope is on-shore Saudi',   evidenceId: 'tr-loc' },
  { id: 'class',     label: 'Project class',  value: 'Major Project',basis: 'Lump-Sum Turnkey scope',       evidenceId: 'tr-scope' },
];

/* Evidence — actual PR snippets Procura cited for each auto-detected check.
   CR clicks "View source" → opens this in the doc preview modal. */
const EVIDENCE = {
  'pr-scope': {
    title: 'PR-2026-04481 · Scope of Work (excerpt)',
    issuedBy: 'Source: Section 3 of PR form · authored by D&CE',
    issuedOn: 'Submitted 2026-05-12',
    sections: [
      { h: 'Scope statement', p: '"Hookup and commissioning of Jubail Phase 3 process trains, including piping tie-ins to Trains 4A/4B, instrumentation loop checks per ARAMCO SAEP-318, pre-commissioning of mechanical packages, and PAC handover to Operations."' },
      { h: 'Deliverables', p: '12 mechanical packages · 340 instrumentation loops · 8 long-lead valves · PAC certification package.' },
      { h: 'Procura\'s verification', p: 'Scope is measurable (deliverables count provided), references SAEP standards, and matches a known commissioning pattern. Schedule B can be auto-built.' },
    ],
  },
  'pr-specs': {
    title: 'PR-2026-04481 · Attached technical specs',
    issuedBy: 'Source: PR attachments table',
    issuedOn: 'All attachments verified 2026-05-12',
    sections: [
      { h: 'P-ID rev 7', p: 'Process & Instrumentation Diagram for Train 4A/4B tie-ins. 42 sheets. Signed by Engineering Manager 2026-04-18.' },
      { h: 'PFD rev 3', p: 'Process Flow Diagram with stream tables. 18 sheets. Latest revision after Apr 26 walkdown.' },
      { h: 'MTO v2', p: 'Material Take-Off with full BOQ — pipe, fittings, valves, instrumentation. $42.6M material content.' },
      { h: 'Procura\'s verification', p: 'All three required artifacts for MP-IK-LSTK template are present, current, and signed by the appropriate authority.' },
    ],
  },
  'pr-ce': {
    title: 'PR-2026-04481 · Company Estimate (sealed)',
    issuedBy: 'Source: Cost Engineering Org · Estimate Class 3',
    issuedOn: 'Sealed 2026-04-29',
    sections: [
      { h: 'Estimate summary', p: 'CE total: $60,237,000 (Class 3 estimate · ±15% confidence band).' },
      { h: 'Breakdown', p: 'Direct labour $14.8M · Materials $42.6M · Indirect/PM $1.9M · Contingency $0.9M.' },
      { h: 'Seal & lock', p: 'Estimate sealed by Cost Engineering. Will open automatically after BRT technical pass per §5.4.10. CR cannot view detail until then.' },
      { h: 'Procura\'s verification', p: 'CE is sealed, dated within 30 days, and authored by approved Cost Engineering org. Required for any LFPA ≥ $50M.' },
    ],
  },
  'pr-iktva': {
    title: 'PR-2026-04481 · IKTVA & Saudization targets',
    issuedBy: 'Source: PR compliance section + Aramco mandates',
    issuedOn: 'Targets locked at PR approval',
    sections: [
      { h: 'IKTVA floor', p: '52% minimum In-Kingdom Total Value Added (set by Aramco IKTVA Office per FY26 mandate for major in-kingdom projects).' },
      { h: 'Saudization', p: '35% Saudi nationals in Operations roles · 12% in Senior Management (SM) — per Saudization Council 2026 plan.' },
      { h: 'Penalties', p: 'Per Schedule S of the template — sliding-scale damages if quarterly self-cert falls below floors.' },
      { h: 'Procura\'s verification', p: 'Both targets are present, numeric, and within current Aramco mandate ranges.' },
    ],
  },
  'tr-value': {
    title: 'PR field: Estimated value',
    issuedBy: 'Source: PR header · field "estimatedValue"',
    issuedOn: 'Value field locked at PR approval',
    sections: [
      { h: 'Reading', p: '$68,400,000 (matches the sealed CE band of $60.2M ±15%).' },
      { h: 'Why it drives the track', p: 'Aramco Procurement Manual §3.2: any contract value ≥ $50M is a Long-Form PA (LFPA, not SFPA) and triggers Supplemental Review Committee (SRC) routing.' },
      { h: 'Procura\'s conclusion', p: '$68.4M → LFPA + SRC required (both checks pass the $50M threshold).' },
    ],
  },
  'tr-loc': {
    title: 'PR field: Delivery location',
    issuedBy: 'Source: PR field "deliverySite" + scope geo references',
    issuedOn: 'Confirmed by site code lookup',
    sections: [
      { h: 'Reading', p: 'Delivery site code: JUB-IK-04 (Jubail Industrial City, Saudi Arabia). Scope text references on-shore commissioning at Phase 3 facility.' },
      { h: 'Why it drives the track', p: 'In-Kingdom delivery uses standard LFPA terms. Out-of-Kingdom would trigger Schedule B Law Org review, OOK reviewer assignment, and a non-standard pricing schedule.' },
      { h: 'Procura\'s conclusion', p: 'In-Kingdom (IK) — standard reviewer routing, no OOK overlay.' },
    ],
  },
  'tr-scope': {
    title: 'PR field: Scope type · delivery model',
    issuedBy: 'Source: scope text + delivery model field',
    issuedOn: 'Inferred from scope keywords',
    sections: [
      { h: 'Reading', p: 'Scope text contains: "turnkey hookup", "lump-sum delivery", "single responsible contractor". Delivery model field: LSTK.' },
      { h: 'Why it drives the track', p: 'Lump-Sum Turnkey on a $50M+ in-kingdom project = "Major Project" class. Triggers Schedule G (Major Project terms) and MP reviewer set (Law · CP&CCD · Tech).' },
      { h: 'Procura\'s conclusion', p: 'Major Project class · LSTK delivery → MP-IK-LSTK template recommended.' },
    ],
  },
};

/* Reserved PA number — system allocates next sequential ID in the LFPA series */
const PA_NUMBER = 'PA-LFPA-0218';

const DEFAULT_REVIEWERS = [
  { id: 'law',   role: 'Law',     who: 'F. Al-Nasser',  sla: '2 days', on: true },
  { id: 'cp',    role: 'CP&CCD',  who: 'S. Bin-Saleh',  sla: '3 days', on: true },
  { id: 'tech',  role: 'Tech',    who: 'A. Al-Mahmoud', sla: '2 days', on: true },
  { id: 'iktva', role: 'IKTVA',   who: 'M. Al-Otaibi',  sla: '3 days', on: true },
  { id: 'smp',   role: 'SMPCAD',  who: 'K. Al-Faraj',   sla: '4 days', on: false },
];

/* Mock PR + PRS doc content for preview modal */
const PR_DOC = {
  title: 'Purchase Requisition · PR-2026-04481',
  issuedBy: 'Ahmed Al-Mahmoud · D&CE',
  issuedOn: '2026-05-12',
  sections: [
    { h: 'Scope summary', p: 'Hookup & commissioning of Jubail Phase 3 process trains. Includes piping tie-ins, instrumentation loop checks, and pre-commissioning of Train 4A.' },
    { h: 'Estimated value', p: '$68.4M (sealed Company Estimate at $60.2M).' },
    { h: 'Delivery window', p: 'Mob by 2026-09-15 · PAC by 2027-04-30.' },
    { h: 'Compliance flags', p: 'In-Kingdom · IKTVA 52% minimum · Saudization 35% Ops, 12% SM · SRC routing required (≥$50M).' },
  ],
};
/* Template-specific preview content keyed by template id.
   Falls back to a generic structure if not found. */
const TEMPLATE_DOCS = {
  'MP-IK-LSTK': {
    title: 'MP-IK-LSTK · Standard Agreement Template',
    issuedBy: 'Aramco Law Org · v3.2 · Clause Library 2026',
    issuedOn: 'Last updated 2026-03-01',
    sections: [
      { h: 'Article 1 · Definitions', p: '32 standard terms defined: "Affiliate", "Aramco Group", "Change Order", "Company Estimate", "IKTVA Score", "Long-Lead Items", "Lump-Sum Turnkey", "Pre-Commissioning", "PAC", "Schedule" …' },
      { h: 'Article 2 · Scope of work', p: 'References Schedule B (Scope). Contractor delivers turnkey: engineering, procurement, construction, pre-commissioning, and PAC handover.' },
      { h: 'Article 4 · Compensation', p: 'Lump-Sum. References Schedule C (Pricing). Milestones at mob, 30% physical progress, 60%, 90%, PAC. Retention 10% released at FAC.' },
      { h: 'Article 6 · IKTVA & Saudization', p: 'Contractor commits to IKTVA score ≥ proposal; Saudization 35% Ops + 12% SM. Quarterly self-certification. Penalties per Schedule S.' },
      { h: 'Article 8 · Variations', p: 'Change Orders processed per Aramco Variation Procedure §8.2. Materials variations > $1M trigger SMPCAD review.' },
      { h: 'Article 14 · Termination', p: 'For convenience: 60-day notice + cost to date. For cause: per OOK exception (8.2, 14.1 amended for In-Kingdom contracts).' },
      { h: 'Schedules attached', p: 'B (Scope) · C (Pricing, Lump-Sum) · S/H (Saudization & Safety) · G (Major Project terms).' },
    ],
  },
};

/* Variable fields the CR fills in (or accepts pre-fill from PR) before generation */
const DEFAULT_FIELDS = {
  contractValue: '$68.4M',
  startDate: '2026-09-15',
  pacDate: '2027-04-30',
  saudization: '35% Ops · 12% SM',
  iktva: '52% minimum',
  retention: '10% (released at FAC)',
  ceClause: 'Sealed CE — opened after BRT',
  specialTerms: '',
};

const PRS_DOC = {
  title: 'Pre-Requisition Submission · PR-2026-04481',
  issuedBy: 'Procura · auto-extracted',
  issuedOn: '2026-05-12',
  sections: [
    { h: 'PR Justification', p: 'Continuation of Jubail Phase 2 commissioning contract; vendor familiarity required to meet schedule.' },
    { h: 'Budget code', p: 'CAPEX 2026 · CD-PSCM-04A · Approved by VP-Operations.' },
    { h: 'Attached specs', p: 'P-ID rev 7, Process Flow Diagram rev 3, Material Take-off v2, IKTVA Compliance Sheet.' },
    { h: 'Prior contract reference', p: 'PA-LFPA-0184 (ZahidEng, $51.8M, performance 4.7/5).' },
  ],
};

export default function PADraft() {
  const navigate = useNavigate();
  const location = useLocation();
  const hashStep = (location.hash || '').replace('#', '');
  const initialIdx = Math.max(0, PA_STEPS.findIndex((s) => s.id === hashStep));
  const [stepIdx, setStepIdx] = useState(initialIdx === -1 ? 0 : initialIdx);
  const [picked, setPicked] = useState(PA_RECO.pick);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [reviewers, setReviewers] = useState(DEFAULT_REVIEWERS);
  const [doc, setDoc] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const setField = (k, v) => setFields((f) => ({ ...f, [k]: v }));
  const [confirm, setConfirm] = useState(null); // {title, body, onYes}
  const [toast, setToast] = useState(null);
  const [prStatus, setPrStatus] = useState('In PA Draft');
  const [trackOverridden, setTrackOverridden] = useState(false);
  const [trackValues, setTrackValues] = useState(
    TRACK.reduce((acc, t) => ({ ...acc, [t.id]: t.value }), {})
  );
  const [editingTrack, setEditingTrack] = useState(null); // id of cell editing
  const [trackDraft, setTrackDraft] = useState('');
  const TRACK_OPTIONS = {
    agreement: ['LFPA', 'SFPA', 'GCS', 'TA'],
    route:     ['SRC required', 'BOC only', 'Auto-approve'],
    location:  ['In-Kingdom', 'Out-of-Kingdom', 'Hybrid'],
    class:     ['Major Project', 'Standard', 'GCS Advisory'],
  };
  const saveTrackCell = () => {
    setTrackValues((v) => ({ ...v, [editingTrack]: trackDraft }));
    setTrackOverridden(true);
    setEditingTrack(null);
    setToast({ tone: 'ok', msg: 'Track cell overridden' });
    setTimeout(() => setToast(null), 3000);
  };

  /* Per-schedule remove state */
  const [removedSchedules, setRemovedSchedules] = useState({});
  const removeSched = (id) => {
    setRemovedSchedules((r) => ({ ...r, [id]: true }));
    setToast({ tone: 'warn', msg: 'Schedule removed from PA' });
    setTimeout(() => setToast(null), 3000);
  };
  const restoreSched = (id) => {
    setRemovedSchedules((r) => { const n = { ...r }; delete n[id]; return n; });
  };

  /* Replace reviewer name */
  const [replacingRev, setReplacingRev] = useState(null);
  const ALT_REVIEWERS = {
    law:   ['F. Al-Nasser', 'H. Al-Qahtani', 'L. Al-Rashid'],
    cp:    ['S. Bin-Saleh', 'O. Al-Dossari', 'R. Al-Harbi'],
    tech:  ['A. Al-Mahmoud', 'I. Al-Ghamdi', 'N. Al-Shehri'],
    iktva: ['M. Al-Otaibi', 'T. Al-Anazi', 'Y. Al-Mutairi'],
    smp:   ['K. Al-Faraj', 'B. Al-Khalifa', 'Z. Al-Sulaiman'],
  };
  const replaceReviewer = (id, who) => {
    setReviewers((rs) => rs.map((x) => x.id === id ? { ...x, who } : x));
    setReplacingRev(null);
    setToast({ tone: 'ok', msg: 'Reviewer reassigned' });
    setTimeout(() => setToast(null), 3000);
  };
  const [paReleased, setPaReleased] = useState(false);
  /* Structured strategy state. Each row holds its raw fields and a
     display() function that formats them for the read-only view. */
  const [strategy, setStrategy] = useState({
    br: { iktva: 65,  vendors: 8 },                   // bidder reach
    ce: { mode: 'sealed-after-brt' },                 // CE strategy enum
    ws: { rfp: 14, qa: 7 },                           // window — days
    sz: { ops: 35, sm: 12 },                          // saudization — percentages
  });
  const STRAT_META = [
    { id: 'br', tone: 'b', label: 'Bidder reach' },
    { id: 'ce', tone: 't', label: 'CE strategy' },
    { id: 'ws', tone: 'b', label: 'Window' },
    { id: 'sz', tone: 'g', label: 'Saudization floor' },
  ];
  const stratDisplay = (id, v = strategy[id]) => ({
    br: `IKTVA ≥ ${v.iktva}% · ${v.vendors} vendors`,
    ce: { 'open':              'Open from start',
          'sealed-after-brt':  'Sealed · open after BRT',
          'sealed-after-irt':  'Sealed · open after IRT' }[v.mode],
    ws: `${v.rfp} days RFP + ${v.qa} day Q&A`,
    sz: `${v.ops}% Ops · ${v.sm}% SM`,
  }[id]);
  const [editingStrat, setEditingStrat] = useState(null);
  const [stratDraft, setStratDraft] = useState(null);
  const startEditStrat = (id) => { setEditingStrat(id); setStratDraft({ ...strategy[id] }); };
  const saveStrat = () => {
    setStrategy((s) => ({ ...s, [editingStrat]: stratDraft }));
    setEditingStrat(null);
    setToast({ tone: 'ok', msg: 'Strategy updated' });
    setTimeout(() => setToast(null), 3000);
  };
  const setDraftField = (k, v) => setStratDraft((d) => ({ ...d, [k]: v }));

  /* CR-flagged readiness issues — overrides Procura's ✓ per check */
  const [flagged, setFlagged] = useState({}); // { [evidenceId]: 'reason text' }
  const [flagNote, setFlagNote] = useState('');
  const [openFlag, setOpenFlag] = useState(null); // id of row being flagged
  const flaggedCount = Object.keys(flagged).length;

  const toggleFlag = (r) => {
    if (flagged[r.evidenceId]) {
      setFlagged((f) => { const n = { ...f }; delete n[r.evidenceId]; return n; });
    } else {
      setOpenFlag(r.id);
      setFlagNote('');
    }
  };
  const commitFlag = (r) => {
    setFlagged((f) => ({ ...f, [r.evidenceId]: flagNote || 'Needs review' }));
    setOpenFlag(null);
    setFlagNote('');
    setToast({ tone: 'warn', msg: `Issue flagged on "${r.label}"` });
    setTimeout(() => setToast(null), 3000);
  };

  const handBack = () => setConfirm({
    title: 'Hand this PR back to the proponent?',
    body: flaggedCount > 0
      ? `${flaggedCount} issue${flaggedCount > 1 ? 's' : ''} flagged. Ahmed Al-Mahmoud (D&CE) will be notified by email with your notes. The PR leaves your queue and returns to "Pending intake" status until the missing items are fixed.`
      : 'Ahmed Al-Mahmoud (D&CE) will be notified by email. The PR leaves your queue and returns to "Pending intake" status until the missing item is fixed.',
    confirmLabel: 'Yes, hand it back',
    cancelLabel: 'Keep working',
    tone: 'warn',
    onYes: () => {
      setPrStatus('Pending intake');
      setConfirm(null);
      setToast({ tone: 'ok', msg: 'PR-2026-04481 returned to D&CE · removed from your queue' });
      setTimeout(() => setToast(null), 4500);
    },
  });

  const overrideTrack = () => setConfirm({
    title: 'Override the auto-detected contract track?',
    body: 'Procura detected this as LFPA · SRC required · In-Kingdom · Major Project. Overriding may change the available template, the reviewer set, and SRC routing. Are you sure?',
    confirmLabel: 'Yes, override',
    cancelLabel: 'Keep Procura\'s track',
    tone: 'warn',
    onYes: () => {
      setTrackOverridden(true);
      setConfirm(null);
      setToast({ tone: 'ok', msg: 'Track set to manual · template list refreshed' });
      setTimeout(() => setToast(null), 4500);
    },
  });

  const releasePA = () => setConfirm({
    title: 'Release this PA number back to the pool?',
    body: PA_NUMBER + ' will return to the LFPA series and may be assigned to another draft. A new number will be reserved when you continue.',
    confirmLabel: 'Yes, release',
    cancelLabel: 'Keep reserved',
    tone: 'warn',
    onYes: () => {
      setPaReleased(true);
      setConfirm(null);
      setToast({ tone: 'ok', msg: 'PA number released · a new one will be reserved on continue' });
      setTimeout(() => setToast(null), 4500);
    },
  });

  useEffect(() => {
    const wanted = '#' + PA_STEPS[stepIdx].id;
    if (location.hash !== wanted) {
      navigate(location.pathname + wanted, { replace: true });
    }
  }, [stepIdx, location.hash, location.pathname, navigate]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setDoc(null); setShowHelp(false); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const step = PA_STEPS[stepIdx];
  const isLast = stepIdx === PA_STEPS.length - 1;
  const next = () => isLast ? navigate('/functional-review') : setStepIdx((i) => i + 1);
  const back = () => stepIdx > 0 ? setStepIdx((i) => i - 1) : navigate('/');

  const pickedTemplate = PA_TEMPLATES.find((t) => t.id === picked);
  const recoTemplate = PA_TEMPLATES.find((t) => t.id === PA_RECO.pick);
  const isReco = picked === PA_RECO.pick;
  const activeReviewers = reviewers.filter((r) => r.on);

  const HELP_BY_STEP = {
    template: 'Four micro-decisions to turn an approved PR into a draftable agreement: confirm the PR is intake-ready, confirm the contract track Procura detected, accept the reserved PA number, and pick the template that matches.',
    schedules: 'Schedules are auto-assembled from the template you chose and the PR scope. Add a custom one only if your scope is unusual.',
    strategy: 'Strategy values are pre-filled from your last 6 awards. Tighten or loosen them by clicking "Change".',
    reviewers: 'Reviewer assignments default per template type. Toggle SMPCAD if Schedule C has long-lead materials ≥$1M.',
    finalize: 'Review the recap. When you continue, Procura assembles the PA draft + schedules and routes to reviewers.',
  };

  /* Sub-step help — shown via info icon next to each setup-block heading */
  const SETUP_HELP = {
    readiness: 'Procura ran four intake checks the moment the PR landed in your inbox: scope clarity, technical specs presence, sealed Company Estimate, and IKTVA/Saudization targets. The CR glances at the result and either continues (all green) or hands the PR back to the proponent (D&CE) if anything is missing.',
    track: 'Procura reads four PR attributes — value, location, scope type, agreement family — and concludes the contract track (LFPA/SFPA/GCS · IK/OOK · MP/etc). The track drives template choice, reviewer routing, and SRC handling. The CR confirms or overrides if the PR misclassifies the work.',
    panum: 'The system pulls the next sequential number from the LFPA series and holds it for this draft. Reservation expires in 14 days if the draft isn\'t generated — the number then returns to the pool for the next CR.',
    template: 'Procura recommends the template that matches the track above. The CR can accept and continue, preview the template content, fill in the variable fields (value, dates, Saudization, etc.) before generation, or override to a different template entirely.',
  };
  const [openHelp, setOpenHelp] = useState(null);
  const toggleHelp = (id) => setOpenHelp((cur) => (cur === id ? null : id));

  return (
    <div className="page pa-page">
      <div className="wrap">

        {/* ── PR IDENTITY BANNER ────────────────────────────────── */}
        <div className="pr-banner">
          <div className="pr-banner-l">
            <div className="pr-banner-title">
              <span className="pr-banner-code">{PA_HEADER.pr}</span>
              <span className="pr-banner-name">{PA_HEADER.title}</span>
            </div>
            <div className="pr-banner-meta">
              <span><b>{PA_HEADER.value}</b> · {PA_HEADER.track}</span>
              <span className="sep">·</span>
              <span>Proponent: <b>{PA_HEADER.proponent}</b> ({PA_HEADER.dept})</span>
              <span className="sep">·</span>
              <span>{PA_HEADER.notes}</span>
            </div>
          </div>
          <div className="pr-banner-r">
            <div className="pr-status">
              <div className="pr-status-head">
                <span className={'status-chip pr-status-chip ' + (prStatus === 'Pending intake' ? 'returned' : 'pending')}>{prStatus}</span>
                <span className="pr-stage-count">Stage <b>2</b>/7</span>
              </div>
              <div className="pr-status-progress">
                <span className="pr-stage-bar" aria-label="Stage 2 of 7">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className={'seg ' + (i < 1 ? 'is-done' : i === 1 ? 'is-active' : '')} />
                  ))}
                </span>
                <span className="pr-status-left"><b>1.5d</b> left <span className="dim">· 24m elapsed</span></span>
              </div>
            </div>
            <div className="pr-banner-actions">
              <button className="pbtn xs" onClick={() => setDoc(PR_DOC)}>{ICO.eye}<span>View PR</span></button>
              <button className="pbtn xs" onClick={() => setDoc(PRS_DOC)}>{ICO.paper}<span>PRS</span></button>
            </div>
          </div>
        </div>

        {/* ── WIZARD STEPPER ───────────────────────────────────── */}
        <div className="wiz-stepper" role="tablist">
          {PA_STEPS.map((s, i) => {
            const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'next';
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={state === 'active'}
                className={`wiz-step is-${state}`}
                onClick={() => setStepIdx(i)}
              >
                <span className="wiz-num">{state === 'done' ? '✓' : i + 1}</span>
                <span className="wiz-label">{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* ── STEP CONTENT (full-width — Procura tips live in the rail) ── */}
        <div className="pa-main">
          <div className="step-card">
            <div className="step-card-head">
              <div className="step-head-l">
                <div className={'step-badge tone-' + step.tone} aria-hidden="true">
                  <span className="sb-ic">{ICO[step.ico] || ICO.doc}</span>
                </div>
                <div className="step-title-block">
                  <div className="step-eyebrow">Step {stepIdx + 1} of {PA_STEPS.length}</div>
                  <h2 className="step-title">
                    {step.label}
                  <button
                    type="button"
                    className="info-btn"
                    aria-label="What is this step?"
                    onMouseEnter={() => setShowHelp(true)}
                    onMouseLeave={() => setShowHelp(false)}
                    onClick={() => setShowHelp((s) => !s)}
                  >
                    {ICO.info}
                    {showHelp && (
                      <span className="info-pop" role="tooltip">{HELP_BY_STEP[step.id]}</span>
                    )}
                  </button>
                </h2>
                </div>
              </div>
              {stepIdx > 0 && (
                <button className="pbtn ghost tiny" onClick={() => setStepIdx(stepIdx - 1)}>
                  {ICO.arrowL}<span>Back</span>
                </button>
              )}
            </div>

            {/* === STEP 1: SET UP THE AGREEMENT === */}
            {step.id === 'template' && (
              <div className="step-body">

                {/* (a) PR readiness check */}
                <section className="setup-block">
                  <header className="setup-block-head">
                    <div className="setup-eyebrow">Step 1</div>
                    <h4>Is this PR ready to draft?
                      <button
                        type="button" className="info-btn"
                        aria-label="How PR readiness works"
                        onClick={() => toggleHelp('readiness')}
                        onMouseEnter={() => setOpenHelp('readiness')}
                        onMouseLeave={() => setOpenHelp(null)}
                      >
                        {ICO.info}
                        {openHelp === 'readiness' && <span className="info-pop" role="tooltip">{SETUP_HELP.readiness}</span>}
                      </button>
                    </h4>
                    <span className="ai-chip" title="Procura ran 4 intake checks against the PR record">
                      <span className="ai-chip-dot"></span>
                      Procura · checked 2s ago
                    </span>
                  </header>
                  <ul className="readiness-list">
                    {READINESS.map((r) => {
                      const isFlagged = !!flagged[r.evidenceId];
                      return (
                        <li key={r.id} className={isFlagged ? 'miss' : 'ok'}>
                          <span className="rd-ic">{isFlagged ? '!' : '✓'}</span>
                          <span className="rd-body">
                            <span className="rd-label">{r.label}</span>
                            <span className="rd-note">
                              {isFlagged
                                ? <><b>Flagged:</b> {flagged[r.evidenceId]}</>
                                : r.note}
                            </span>
                            {openFlag === r.id && (
                              <div className="rd-flag-form">
                                <input
                                  type="text"
                                  placeholder="What's the issue? (e.g. CE band missing, specs not signed)"
                                  value={flagNote}
                                  autoFocus
                                  onChange={(e) => setFlagNote(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitFlag(r);
                                    if (e.key === 'Escape') setOpenFlag(null);
                                  }}
                                />
                                <button className="pbtn tiny ghost" onClick={() => setOpenFlag(null)}>Cancel</button>
                                <button className="pbtn tiny primary" onClick={() => commitFlag(r)}>Flag</button>
                              </div>
                            )}
                          </span>
                          <div className="rd-actions">
                            <button
                              type="button"
                              className="rd-source"
                              onClick={(e) => { e.stopPropagation(); setDoc(EVIDENCE[r.evidenceId]); }}
                              title="Open the PR section Procura cited for this check"
                            >
                              {ICO.eye}<span>View source</span>
                            </button>
                            <button
                              type="button"
                              className={'rd-flag ' + (isFlagged ? 'is-on' : '')}
                              onClick={() => toggleFlag(r)}
                              title={isFlagged ? 'Clear flag' : 'Mark this check as an issue'}
                            >
                              {isFlagged ? '✕ Clear' : '⚑ Flag'}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="setup-foot">
                    {flaggedCount === 0 ? (
                      <span className="setup-state ok">All 4 checks passed · OK to draft</span>
                    ) : (
                      <span className="setup-state warn">{flaggedCount} of {READINESS.length} flagged · cannot draft until fixed</span>
                    )}
                    <button className="link-btn" type="button" onClick={handBack}>Hand back to proponent</button>
                  </div>
                </section>

                {/* (b) Contract track */}
                <section className="setup-block">
                  <header className="setup-block-head">
                    <div className="setup-eyebrow">Step 2</div>
                    <h4>Contract track
                      <button
                        type="button" className="info-btn"
                        aria-label="How contract track is derived"
                        onClick={() => toggleHelp('track')}
                        onMouseEnter={() => setOpenHelp('track')}
                        onMouseLeave={() => setOpenHelp(null)}
                      >
                        {ICO.info}
                        {openHelp === 'track' && <span className="info-pop" role="tooltip">{SETUP_HELP.track}</span>}
                      </button>
                    </h4>
                    <span className="ai-chip" title="Procura derived track from PR value, location, scope, agreement family">
                      <span className="ai-chip-dot"></span>
                      Procura · derived 2s ago
                    </span>
                  </header>
                  <div className="track-grid">
                    {TRACK.map((t) => {
                      const isOverridden = trackValues[t.id] !== t.value;
                      const isEditing = editingTrack === t.id;
                      return (
                        <div key={t.id} className={'track-cell ' + (isOverridden ? 'is-overridden' : '')}>
                          <div className="tc-label">
                            {t.label}
                            {isOverridden && <span className="tc-badge">Overridden</span>}
                          </div>
                          {isEditing ? (
                            <div className="tc-editor">
                              <select
                                value={trackDraft}
                                autoFocus
                                onChange={(e) => setTrackDraft(e.target.value)}
                              >
                                {TRACK_OPTIONS[t.id].map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                              <div className="tc-edit-actions">
                                <button className="pbtn tiny ghost" onClick={() => setEditingTrack(null)}>Cancel</button>
                                <button className="pbtn tiny primary" onClick={saveTrackCell}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="tc-value">{trackValues[t.id]}</div>
                              <div className="tc-basis">{isOverridden ? `Procura had: ${t.value}` : t.basis}</div>
                            </>
                          )}
                          <div className="tc-actions">
                            <button
                              type="button"
                              className="tc-source"
                              onClick={() => setDoc(EVIDENCE[t.evidenceId])}
                              title="Open the PR field Procura read to derive this"
                            >{ICO.eye} View PR field</button>
                            {!isEditing && (
                              <button
                                type="button"
                                className="tc-override"
                                onClick={() => { setEditingTrack(t.id); setTrackDraft(trackValues[t.id]); }}
                                title="Change this dimension"
                              >Override</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="setup-foot">
                    <span className={'setup-state ' + (trackOverridden ? 'warn' : 'ok')}>
                      {trackOverridden ? 'Track manually overridden' : 'Track confirmed'}
                    </span>
                    <button className="link-btn" type="button" onClick={overrideTrack}>Override track</button>
                  </div>
                </section>

                {/* (c) PA number reservation */}
                <section className="setup-block setup-pa">
                  <header className="setup-block-head">
                    <div className="setup-eyebrow">Step 3</div>
                    <h4>PA number reserved
                      <button
                        type="button" className="info-btn"
                        aria-label="How PA number reservation works"
                        onClick={() => toggleHelp('panum')}
                        onMouseEnter={() => setOpenHelp('panum')}
                        onMouseLeave={() => setOpenHelp(null)}
                      >
                        {ICO.info}
                        {openHelp === 'panum' && <span className="info-pop" role="tooltip">{SETUP_HELP.panum}</span>}
                      </button>
                    </h4>
                    <span className="ai-chip" title="Procura pulled the next sequential PA number from the LFPA series">
                      <span className="ai-chip-dot"></span>
                      Procura · reserved 2s ago
                    </span>
                  </header>
                  <div className="pa-reserve">
                    <span className="pa-num">{paReleased ? '— · pending —' : PA_NUMBER}</span>
                    <span className="pa-reserve-meta">
                      {paReleased
                        ? 'Released · a new number will be reserved on continue'
                        : 'LFPA series · expires in 14 days if not generated'}
                    </span>
                  </div>
                  <div className="setup-foot">
                    <span className={'setup-state ' + (paReleased ? 'warn' : 'ok')}>
                      {paReleased ? 'Reservation released' : 'Held for this draft'}
                    </span>
                    {!paReleased && (
                      <button className="link-btn" type="button" onClick={releasePA}>Release back to pool</button>
                    )}
                  </div>
                </section>

                {/* (d) Template pick — the main decision */}
                <section className="setup-block">
                  <header className="setup-block-head">
                    <div className="setup-eyebrow">Step 4</div>
                    <h4>Pick the agreement template
                      <button
                        type="button" className="info-btn"
                        aria-label="How template matching works"
                        onClick={() => toggleHelp('tmpl')}
                        onMouseEnter={() => setOpenHelp('tmpl')}
                        onMouseLeave={() => setOpenHelp(null)}
                      >
                        {ICO.info}
                        {openHelp === 'tmpl' && <span className="info-pop" role="tooltip">{SETUP_HELP.template}</span>}
                      </button>
                    </h4>
                    <span className="ai-chip" title="Procura matched template to the contract track">
                      <span className="ai-chip-dot"></span>
                      Procura · matched 2s ago
                    </span>
                  </header>
                <div className="reco-hero">
                  <div className="reco-hero-l">
                    <div className="reco-hero-pill">
                      {ICO.sparkle}
                      <span>{isReco ? 'Procura recommends' : 'You selected'}</span>
                    </div>
                    <h3 className="reco-hero-id">{pickedTemplate.id}</h3>
                    <div className="reco-hero-name">{pickedTemplate.name}</div>
                    <div className="reco-hero-sub">{pickedTemplate.sub}</div>
                    {!isReco && (
                      <div className="reco-hero-revert">
                        Procura&apos;s pick was <b>{recoTemplate.id}</b>.
                        <button className="link-btn" type="button" onClick={() => setPicked(PA_RECO.pick)}>Revert</button>
                      </div>
                    )}
                  </div>
                  <div className="reco-hero-r">
                    <button className="pbtn-premium" onClick={next}>
                      <span className="pbtn-premium-label">Accept &amp; continue</span>
                      <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
                    </button>
                    <button
                      className="pbtn"
                      onClick={() => setDoc(TEMPLATE_DOCS[pickedTemplate.id] || {
                        title: pickedTemplate.id + ' · ' + pickedTemplate.name,
                        issuedBy: 'Aramco Law Org',
                        issuedOn: 'Preview not yet authored',
                        sections: [{ h: 'Coming soon', p: 'Full preview content for this template will appear here.' }],
                      })}
                    >{ICO.eye}<span>Preview template</span></button>
                    <button
                      className="pbtn"
                      onClick={() => setShowFields((s) => !s)}
                    >{ICO.paper}<span>{showFields ? 'Hide fields' : 'Fill fields'}</span></button>
                    <button
                      className="pbtn ghost"
                      onClick={() => setShowAllTemplates((s) => !s)}
                    >{showAllTemplates ? 'Hide other templates' : 'See other templates'}</button>
                  </div>
                </div>

                {showFields && (
                  <div className="tmpl-fields">
                    <div className="tmpl-fields-head">
                      <div>
                        <div className="tmpl-fields-eyebrow">Variable fields · pre-filled from PR</div>
                        <h4>Fill in template details</h4>
                      </div>
                      <button className="link-btn" onClick={() => setFields(DEFAULT_FIELDS)}>Reset to PR defaults</button>
                    </div>
                    <div className="tmpl-fields-grid">
                      {[
                        { k: 'contractValue', label: 'Contract value' },
                        { k: 'startDate',     label: 'Mob / start date' },
                        { k: 'pacDate',       label: 'PAC date' },
                        { k: 'saudization',   label: 'Saudization commitment' },
                        { k: 'iktva',         label: 'IKTVA floor' },
                        { k: 'retention',     label: 'Retention terms' },
                        { k: 'ceClause',      label: 'CE handling' },
                      ].map(({ k, label }) => (
                        <label key={k} className="tmpl-field">
                          <span className="tf-label">{label}</span>
                          <input
                            type="text"
                            value={fields[k]}
                            onChange={(e) => setField(k, e.target.value)}
                          />
                        </label>
                      ))}
                      <label className="tmpl-field tmpl-field-wide">
                        <span className="tf-label">Special terms (optional)</span>
                        <textarea
                          rows="2"
                          value={fields.specialTerms}
                          onChange={(e) => setField('specialTerms', e.target.value)}
                          placeholder="e.g. extended liability cap, accelerated milestone schedule, escrow arrangement…"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {showAllTemplates && (
                  <div className="template-grid">
                    {PA_TEMPLATES.filter((t) => t.id !== picked).map((t) => (
                      <button
                        key={t.id}
                        className="tmpl-row"
                        onClick={() => { setPicked(t.id); setShowAllTemplates(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      >
                        <div className="tmpl-id">{t.id}</div>
                        <div className="tmpl-info">
                          <div className="tmpl-name">{t.name}</div>
                          <div className="tmpl-sub">{t.sub}</div>
                        </div>
                        <div className="tmpl-cta">Use this</div>
                      </button>
                    ))}
                  </div>
                )}
                </section>
              </div>
            )}

            {/* === STEP 2: CONFIRM SCHEDULES === */}
            {step.id === 'schedules' && (
              <div className="step-body">
                <div className="step-meta-row">
                  <span className="ai-chip">
                    <span className="ai-chip-dot"></span>
                    Procura · assembled 2s ago
                  </span>
                  <button
                    type="button" className="info-btn standalone"
                    onClick={() => toggleHelp('schedHelp')}
                    onMouseEnter={() => setOpenHelp('schedHelp')}
                    onMouseLeave={() => setOpenHelp(null)}
                    aria-label="How schedules are assembled"
                  >
                    {ICO.info} <span>How this works</span>
                    {openHelp === 'schedHelp' && (
                      <span className="info-pop" role="tooltip">
                        Each PA template declares which schedules it requires. Procura assembles them from the PR scope (Schedule B from SOW, Schedule C from pricing model, Schedule S from Saudization targets, etc.). The CR confirms each one or adds a custom schedule for unusual scope (e.g. multi-site, foreign-currency component).
                      </span>
                    )}
                  </button>
                </div>
                <p className="cr-action">
                  <b>Your action:</b> glance through the auto-assembled schedules. Click <b>View</b> to inspect a schedule&apos;s content, or <b>＋ Add custom schedule</b> if scope demands something non-standard.
                </p>
                <div className="sched-list">
                  {PA_SCHEDULES.map((s) => {
                    const isRemoved = !!removedSchedules[s.id];
                    return (
                      <div key={s.id} className={'sched-row ' + (isRemoved ? 'is-removed' : '')}>
                        <div className="sched-id">Schedule {s.id}</div>
                        <div className="sched-info">
                          <div className="sched-name">{s.name}</div>
                          <div className="sched-source">{s.source}</div>
                        </div>
                        <div className="sched-actions">
                          {isRemoved ? (
                            <>
                              <span className="status-chip returned">Removed</span>
                              <button className="pbtn tiny ghost" onClick={() => restoreSched(s.id)}>Restore</button>
                            </>
                          ) : (
                            <>
                              <button className="pbtn tiny ghost" onClick={() => setDoc({
                                title: 'Schedule ' + s.id + ' · ' + s.name,
                                issuedBy: 'Source: ' + s.source + ' · auto-assembled by Procura',
                                issuedOn: 'Will be attached to PA-' + (paReleased ? 'TBD' : 'LFPA-0218'),
                                sections: [{ h: 'Status', p: 'Schedule pre-filled from PR data and template defaults. Detailed line items will be authored during functional review.' }],
                              })}>View</button>
                              <span className="status-chip endorsed">Auto-included</span>
                              <button className="sched-remove" onClick={() => removeSched(s.id)} title="Remove this schedule from the PA">✕</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <button className="sched-add">＋ Add custom schedule</button>
                </div>
              </div>
            )}

            {/* === STEP 3: SET STRATEGY === */}
            {step.id === 'strategy' && (
              <div className="step-body">
                <div className="step-meta-row">
                  <span className="ai-chip">
                    <span className="ai-chip-dot"></span>
                    Procura · suggested 2s ago
                  </span>
                  <button
                    type="button" className="info-btn standalone"
                    onClick={() => toggleHelp('stratHelp')}
                    onMouseEnter={() => setOpenHelp('stratHelp')}
                    onMouseLeave={() => setOpenHelp(null)}
                    aria-label="How strategy is set"
                  >
                    {ICO.info} <span>How this works</span>
                    {openHelp === 'stratHelp' && (
                      <span className="info-pop" role="tooltip">
                        Procura suggests bidding strategy values based on your last 6 awards in the same track. The CR can accept defaults or tune each value — bidder reach (which IKTVA tier qualifies), CE strategy (sealed vs open + when), RFP window (days for bid + Q&A), Saudization floor (minimum commitment).
                      </span>
                    )}
                  </button>
                </div>
                <p className="cr-action">
                  <b>Your action:</b> accept Procura&apos;s pre-filled strategy or click <b>Change</b> on any row to override before generating.
                </p>
                <div className="strat-list">
                  {STRAT_META.map((c) => (
                    <div key={c.id} className={`strat-row strat-${c.tone} ${editingStrat === c.id ? 'is-editing' : ''}`}>
                      <div className="strat-label">{c.label}</div>
                      {editingStrat === c.id ? (
                        <>
                          <div className="strat-editor">
                            {c.id === 'br' && (
                              <>
                                <label className="se-field">
                                  <span className="se-lab">IKTVA tier</span>
                                  <div className="seg">
                                    {[50, 65, 75].map((n) => (
                                      <button key={n} type="button"
                                        className={'seg-btn ' + (stratDraft.iktva === n ? 'is-on' : '')}
                                        onClick={() => setDraftField('iktva', n)}>≥ {n}%</button>
                                    ))}
                                  </div>
                                </label>
                                <label className="se-field">
                                  <span className="se-lab">Vendors</span>
                                  <span className="num-wrap">
                                    <input type="number" min="3" max="20" value={stratDraft.vendors}
                                      onChange={(e) => setDraftField('vendors', parseInt(e.target.value) || 0)} />
                                  </span>
                                </label>
                              </>
                            )}
                            {c.id === 'ce' && (
                              <div className="radio-group">
                                {[
                                  { v: 'open',             l: 'Open from start',  s: 'CE shown to bidders upfront' },
                                  { v: 'sealed-after-brt', l: 'Sealed · open after BRT', s: 'Standard for LFPA' },
                                  { v: 'sealed-after-irt', l: 'Sealed · open after IRT', s: 'For IKTVA-sensitive bids' },
                                ].map((o) => (
                                  <label key={o.v} className={'radio-card ' + (stratDraft.mode === o.v ? 'is-on' : '')}>
                                    <input type="radio" name="ce-mode" value={o.v}
                                      checked={stratDraft.mode === o.v}
                                      onChange={() => setDraftField('mode', o.v)} />
                                    <span className="radio-l">{o.l}</span>
                                    <span className="radio-s">{o.s}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {c.id === 'ws' && (
                              <>
                                <label className="se-field">
                                  <span className="se-lab">RFP window</span>
                                  <span className="num-wrap">
                                    <input type="number" min="7" max="45" value={stratDraft.rfp}
                                      onChange={(e) => setDraftField('rfp', parseInt(e.target.value) || 0)} />
                                    <span className="num-suffix">days</span>
                                  </span>
                                </label>
                                <label className="se-field">
                                  <span className="se-lab">Q&amp;A</span>
                                  <span className="num-wrap">
                                    <input type="number" min="0" max="14" value={stratDraft.qa}
                                      onChange={(e) => setDraftField('qa', parseInt(e.target.value) || 0)} />
                                    <span className="num-suffix">days</span>
                                  </span>
                                </label>
                              </>
                            )}
                            {c.id === 'sz' && (
                              <>
                                <label className="se-field">
                                  <span className="se-lab">Ops Saudization</span>
                                  <span className="num-wrap">
                                    <input type="number" min="0" max="100" value={stratDraft.ops}
                                      onChange={(e) => setDraftField('ops', parseInt(e.target.value) || 0)} />
                                    <span className="num-suffix">%</span>
                                  </span>
                                </label>
                                <label className="se-field">
                                  <span className="se-lab">SM Saudization</span>
                                  <span className="num-wrap">
                                    <input type="number" min="0" max="100" value={stratDraft.sm}
                                      onChange={(e) => setDraftField('sm', parseInt(e.target.value) || 0)} />
                                    <span className="num-suffix">%</span>
                                  </span>
                                </label>
                              </>
                            )}
                          </div>
                          <div className="strat-edit-actions">
                            <button className="pbtn tiny ghost" onClick={() => setEditingStrat(null)}>Cancel</button>
                            <button className="pbtn tiny primary" onClick={saveStrat}>Save</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="strat-value">{stratDisplay(c.id)}</div>
                          <button className="pbtn tiny ghost" onClick={() => startEditStrat(c.id)}>Change</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === STEP 4: ASSIGN REVIEWERS === */}
            {step.id === 'reviewers' && (
              <div className="step-body">
                <div className="step-meta-row">
                  <span className="ai-chip">
                    <span className="ai-chip-dot"></span>
                    Procura · routed 2s ago
                  </span>
                  <button
                    type="button" className="info-btn standalone"
                    onClick={() => toggleHelp('revHelp')}
                    onMouseEnter={() => setOpenHelp('revHelp')}
                    onMouseLeave={() => setOpenHelp(null)}
                    aria-label="How reviewers are assigned"
                  >
                    {ICO.info} <span>How this works</span>
                    {openHelp === 'revHelp' && (
                      <span className="info-pop" role="tooltip">
                        Each template type has a default reviewer set (MP-IK-LSTK = Law · CP&CCD · Tech · IKTVA). Procura also auto-suggests the responsive named reviewer per discipline based on prior SLA performance. The CR toggles optional reviewers (e.g. SMPCAD when Schedule C has long-lead materials ≥$1M) and confirms the final routing.
                      </span>
                    )}
                  </button>
                </div>
                <p className="cr-action">
                  <b>Your action:</b> review the default lanes Procura pre-selected. Toggle <b>SMPCAD</b> on if your Schedule C has long-lead materials. Each lane has a 2–4 day SLA.
                </p>
                <div className="rev-list">
                  {reviewers.map((r) => (
                    <div key={r.id} className={`rev-row ${r.on ? 'is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={r.on}
                        onChange={() => setReviewers((rs) => rs.map((x) => x.id === r.id ? { ...x, on: !x.on } : x))}
                      />
                      <div className="rev-info">
                        <div className="rev-role">{r.role}</div>
                        <div className="rev-who">
                          {replacingRev === r.id ? (
                            <span className="rev-replace">
                              <select
                                autoFocus
                                value={r.who}
                                onChange={(e) => replaceReviewer(r.id, e.target.value)}
                              >
                                {ALT_REVIEWERS[r.id].map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <button className="pbtn tiny ghost" onClick={() => setReplacingRev(null)}>Done</button>
                            </span>
                          ) : (
                            <>
                              {r.who} · SLA {r.sla}
                              {r.on && (
                                <button
                                  className="rev-replace-btn"
                                  onClick={() => setReplacingRev(r.id)}
                                  title="Replace with another approved reviewer"
                                >Replace</button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`status-chip ${r.on ? 'pending' : 'next'}`}>
                        {r.on ? 'Will review' : 'Skipped'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === STEP 5: FINALIZE === */}
            {step.id === 'finalize' && (
              <div className="step-body">
                <div className="step-meta-row">
                  <span className="ai-chip">
                    <span className="ai-chip-dot"></span>
                    Procura · ready to assemble
                  </span>
                  <button
                    type="button" className="info-btn standalone"
                    onClick={() => toggleHelp('genHelp')}
                    onMouseEnter={() => setOpenHelp('genHelp')}
                    onMouseLeave={() => setOpenHelp(null)}
                    aria-label="How generation works"
                  >
                    {ICO.info} <span>How this works</span>
                    {openHelp === 'genHelp' && (
                      <span className="info-pop" role="tooltip">
                        When you click <b>Generate PA & route for review</b>, Procura assembles the full PA document from template + filled fields + schedules, attaches it to PA-LFPA-0218, sends review invitations to the {activeReviewers.length} chosen reviewers with their SLAs, and moves this PR from "In PA Draft" to "In Functional Review" status.
                      </span>
                    )}
                  </button>
                </div>
                <p className="cr-action">
                  <b>Your action:</b> review the recap below. Click <b>Preview before sending</b> to see the assembled PA, or <b>Generate PA & route for review</b> to dispatch to {activeReviewers.length} reviewers.
                </p>
                <div className="recap">
                  <div className="recap-row"><span>Template</span><b>{pickedTemplate.id} — {pickedTemplate.name}</b></div>
                  <div className="recap-row"><span>Schedules</span><b>{PA_SCHEDULES.map((s) => s.id).join(' · ')}</b></div>
                  <div className="recap-row"><span>Strategy</span><b>{STRAT_META.map((c) => c.label + ': ' + stratDisplay(c.id)).join(' · ')}</b></div>
                  <div className="recap-row"><span>Reviewers</span><b>{activeReviewers.map((r) => r.role).join(' · ')}</b></div>
                  <div className="recap-row"><span>Estimated SLA</span><b>{Math.max(...activeReviewers.map((r) => parseInt(r.sla)))} days to functional review complete</b></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <button className="pbtn" onClick={() => setDoc({
                    title: 'Assembled PA preview · ' + PA_NUMBER,
                    issuedBy: 'Procura assembled from ' + pickedTemplate.id + ' template',
                    issuedOn: 'Preview only · not yet routed',
                    sections: [
                      { h: 'Heading', p: PA_NUMBER + ' — ' + PA_HEADER.title + ' — Contractor TBD via bid evaluation.' },
                      { h: 'Articles', p: 'Articles 1–14 from MP-IK-LSTK template, with variable fields substituted (value ' + fields.contractValue + ', mob ' + fields.startDate + ', PAC ' + fields.pacDate + ').' },
                      { h: 'Schedules attached', p: PA_SCHEDULES.map((s) => 'Schedule ' + s.id + ' (' + s.name + ')').join('; ') + '.' },
                      { h: 'Reviewer routing', p: activeReviewers.map((r) => r.role + ' (' + r.who + ', SLA ' + r.sla + ')').join('; ') + '.' },
                    ],
                  })}>{ICO.eye}<span>Preview before sending</span></button>
                </div>
              </div>
            )}

          </div>

          {/* Persistent footer */}
          <div className="step-foot">
            <div className="step-foot-l">
              <button className="pbtn ghost" onClick={back}>{ICO.arrowL}<span>{stepIdx === 0 ? 'Back to inbox' : 'Back'}</span></button>
            </div>
            <div className="step-foot-r">
              <button className="pbtn">Save draft</button>
              <button
                className="pbtn-premium"
                onClick={next}
                disabled={stepIdx === 0 && flaggedCount > 0}
                title={stepIdx === 0 && flaggedCount > 0 ? 'Resolve flagged issues or hand back before continuing' : undefined}
              >
                <span className="pbtn-premium-label">{isLast ? 'Generate PA & route for review' : 'Continue'}</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DOC PREVIEW MODAL ────────────────────────────────────── */}
      {doc && (
        <div className="doc-modal" onClick={() => setDoc(null)}>
          <div className="doc-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-head">
              <div>
                <div className="doc-modal-eyebrow">{doc.issuedBy} · {doc.issuedOn}</div>
                <h2>{doc.title}</h2>
              </div>
              <button className="doc-modal-close" onClick={() => setDoc(null)} aria-label="Close">✕</button>
            </div>
            <div className="doc-modal-body">
              {doc.sections.map((s, i) => (
                <section key={i} className="doc-sec">
                  <h4>{s.h}</h4>
                  <p>{s.p}</p>
                </section>
              ))}
            </div>
            <div className="doc-modal-foot">
              <button className="pbtn">{ICO.download}<span>Download PDF</span></button>
              <button className="pbtn-premium" onClick={() => setDoc(null)}>
                <span className="pbtn-premium-label">Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM MODAL ─────────────────────────────────────────── */}
      {confirm && (
        <div className="doc-modal" onClick={() => setConfirm(null)}>
          <div className={'confirm-panel ' + (confirm.tone === 'warn' ? 'is-warn' : '')} onClick={(e) => e.stopPropagation()}>
            <div className="confirm-ic">{confirm.tone === 'warn' ? '!' : '?'}</div>
            <h3 className="confirm-title">{confirm.title}</h3>
            <p className="confirm-body">{confirm.body}</p>
            <div className="confirm-actions">
              <button className="pbtn" onClick={() => setConfirm(null)}>{confirm.cancelLabel || 'Cancel'}</button>
              <button className="pbtn-premium" onClick={confirm.onYes}>
                <span className="pbtn-premium-label">{confirm.confirmLabel || 'Confirm'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────── */}
      {toast && (
        <div className={'toast toast-' + toast.tone}>
          <span className="toast-dot"></span>
          <span className="toast-msg">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
