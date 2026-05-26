import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { FR_HEADER, FR_LANES, FR_CALLOUTS } from '../data/constants';
import { AiChip, InfoIcon, ConfirmModal, Toast, EvidenceModal, PaHero, makeToaster } from '../components/WizardKit';
import { PA_STATUS, STATUS_LABELS, setPaStatus } from '../lib/paStatus';

/* ─── Static config ───────────────────────────────────────────────── */
/* Lane-level status labels (per-reviewer, distinct from PA-level canonical statuses) */
const LANE_STATUS_LABELS = { endorsed: 'Endorsed', pending: 'Pending', returned: 'Returned', blocked: 'Blocked' };

const FR_PA_META = {
  track: 'LFPA · MP-IK-LSTK · SRC route',
  proponent: 'Ahmed Al-Mahmoud',
  dept: 'D&CE',
  notes: '5 concurrence lanes · 3 active callouts',
};
const LIFECYCLE_STAGES = 7;
const CURRENT_STAGE = 3;

const ALT_REVIEWERS = {
  law:    [{ id: 'fa', name: 'F. Al-Nasser', sla: '2h avg' }, { id: 'hr', name: 'H. Al-Rashid', sla: '4h avg' }, { id: 'no', name: 'N. Othman', sla: '1d avg' }],
  cpccd:  [{ id: 'sb', name: 'S. Bin-Saleh', sla: '1d avg' }, { id: 'ma', name: 'M. Al-Anazi', sla: '6h avg' }],
  tech:   [{ id: 'aa', name: 'A. Al-Mahmoud', sla: '4h avg' }, { id: 'jk', name: 'J. Khan', sla: '1d avg' }],
  iktva:  [{ id: 'mo', name: 'M. Al-Otaibi', sla: '1d avg' }, { id: 'rh', name: 'R. Haddad', sla: '2d avg' }],
  smpcad: [{ id: 'kf', name: 'K. Al-Faraj', sla: '2d avg' }, { id: 'tz', name: 'T. Zayed', sla: '1d avg' }],
};

const LANE_EVIDENCE = {
  law:    { eyebrow: 'Source · Law lane note · 14:02 today', title: 'Clauses 8.2 & 14.1 — OOK exception', issuedBy: 'F. Al-Nasser · Law', sections: [{ h: 'Amendment', p: 'Clause 8.2 (Force Majeure) extended to include "supply-chain stoppages affecting long-lead valves >$1M cumulative". Clause 14.1 (Termination for Convenience) capped notice period at 60 days for OOK content >50%.' }, { h: 'Why', p: 'PR Schedule C includes ZahidEng-sourced long-lead valves with declared 56% OOK content. Standard 30-day termination notice creates excessive cancellation exposure on the OOK portion.' }] },
  cpccd:  { eyebrow: 'Source · CP&CCD pending note', title: 'Awaiting CE-sensitivity acknowledgement', issuedBy: 'S. Bin-Saleh · CP&CCD', sections: [{ h: 'Status', p: 'Signed CE-sensitivity NDA is required before CP&CCD can endorse. Procura has the NDA template drafted and ready to send to S. Bin-Saleh.' }] },
  tech:   { eyebrow: 'Source · Tech / D&CE pass note', title: 'Schedule B & spec list aligned with PR', issuedBy: 'A. Al-Mahmoud · Tech / D&CE', sections: [{ h: 'Verdict', p: 'All 47 specs in Schedule B match the PR scope (sections 3.1 — 3.6). No deviations. No clarifications needed.' }] },
  iktva:  { eyebrow: 'Source · IKTVA return note · OVERDUE', title: 'Saudization (Schedule S/SM) below 12% floor', issuedBy: 'M. Al-Otaibi · IKTVA', sections: [{ h: 'Finding', p: 'PA draft sets Saudization commitment at 9% for project staff. Aramco standard for IK MP-LSTK PAs ≥$50M is 12% minimum.' }, { h: 'Required fix', p: 'Update Schedule S/SM to 12% Saudization floor before re-submitting for IKTVA review.' }], quote: '"PA-LFPA-0218 cannot be endorsed by IKTVA at 9% Saudization. Reset to 12% per CSP-IKTVA-2024-Rev3 §3.4." — M. Al-Otaibi' },
  smpcad: { eyebrow: 'Source · SMPCAD pending note', title: 'Materials list (Schedule C) under check', issuedBy: 'K. Al-Faraj · SMPCAD', sections: [{ h: 'Status', p: 'SMPCAD is verifying that all long-lead materials in Schedule C have approved manufacturer source lists (MSL). 14 of 18 line items verified so far.' }] },
};

const CALLOUT_EVIDENCE = {
  c1: { eyebrow: 'Source · IKTVA lane · Schedule S/SM', title: 'Saudization floor breach', sections: [{ h: 'Current vs required', p: 'PA draft Schedule S/SM = 9% Saudization. IKTVA requires 12% minimum for MP-LSTK ≥$50M. Open Schedule S/SM to update the floor.' }] },
  c2: { eyebrow: 'Source · CP&CCD lane', title: 'CE-sensitivity NDA — auto-draft ready', sections: [{ h: 'What this does', p: 'Procura has pre-filled the standard CE-sensitivity NDA with this PA\'s identifiers. Generating it issues the NDA to S. Bin-Saleh for signature; CP&CCD will then endorse.' }] },
  c3: { eyebrow: 'Source · concurrence tracker', title: '2 of 5 lanes endorsed', sections: [{ h: 'Progress', p: 'Law + Tech endorsed. CP&CCD pending acknowledgement, IKTVA returned for Saudization, SMPCAD reviewing materials list.' }] },
};

const PA_DOC = {
  eyebrow: 'Document · PA draft v3 · released 14:02 today',
  title: 'PA-LFPA-0218 — Jubail Hookup & Commissioning Phase 3',
  issuedBy: 'Drafted by you · template MP-IK-LSTK · CE $60.2M sealed',
  sections: [
    { h: 'Scope', p: 'Hookup + commissioning of 6 process modules at Jubail flare-recovery facility.' },
    { h: 'Track', p: 'LFPA · IK · MP-LSTK · SRC route required (value >$50M).' },
  ],
};

/* PA Draft summary — what the CR decided in the 5 PA Draft wizard steps.
   Surfaces so the CR can see "what I already did" without leaving FR. */
const PA_DRAFT_SUMMARY = {
  eyebrow: 'PA Draft summary · all 5 steps completed 2026-05-24',
  title: 'Decisions captured in PA Draft',
  issuedBy: 'You · drafted on 2026-05-24 14:02',
  sections: [
    { h: 'Step 1 — Setup',     p: 'PR-2026-04481 confirmed as intake-ready (4/4 checks passed). Contract track: LFPA · MP-IK-LSTK · SRC route. PA number PA-LFPA-0218 reserved. Template MP-IK-LSTK (Major Project · In-Kingdom · Lump-Sum Turnkey) selected — matches PR scope, value tier, IKTVA target.' },
    { h: 'Step 2 — Schedules', p: 'Auto-assembled: Schedule B (Scope of Work, from PR), Schedule C (Lump Sum pricing), Schedule S (35% Ops Saudization), Schedule S/SM, Schedule G (Major Project terms). No custom schedules added.' },
    { h: 'Step 3 — Strategy',  p: 'IKTVA tier 65% · sealed CE (open after BRT) · 14-day RFP window + 7-day Q&A · Saudization floor 35% Ops / 12% SM. No CR overrides — accepted Procura recommendations.' },
    { h: 'Step 4 — Reviewers', p: 'Routing: Law (F. Al-Nasser), CP&CCD (S. Bin-Saleh), Tech / D&CE (A. Al-Mahmoud), IKTVA (M. Al-Otaibi), SMPCAD (K. Al-Faraj). Default reviewer set for MP-IK-LSTK; SMPCAD added because Schedule C has long-lead materials ≥$1M.' },
    { h: 'Step 5 — Generate',  p: 'PA draft v3 released to functional review at 14:02 with the routing above. Five concurrence lanes opened simultaneously.' },
  ],
};
const PRS_DOC = {
  eyebrow: 'Source · PR Strategy doc · PRS-2026-0218 · 2026-05-12',
  title: 'PR Strategy — PR-2026-04481',
  sections: [
    { h: 'Proponent', p: 'D&CE (A. Al-Mahmoud). Approved by VP Engineering 2026-05-08.' },
    { h: 'Selection rationale', p: 'MP-LSTK chosen for lump-sum cost discipline + single-source accountability. IKTVA ≥65% required.' },
  ],
};

/* ─── Component ───────────────────────────────────────────────────── */
export default function FunctionalReview() {
  const navigate = useNavigate();

  const [lanes, setLanes] = useState(FR_LANES);
  const [nudged, setNudged] = useState({});
  const [flagged, setFlagged] = useState({});
  const [openFlag, setOpenFlag] = useState(null);
  const [flagNote, setFlagNote] = useState('');
  const [replacing, setReplacing] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);   // laneId of open ⋯ menu
  const [resolvedCallouts, setResolvedCallouts] = useState({}); // {calloutId: true}
  const [openHelp, setOpenHelp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [evid, setEvid] = useState(null);
  const [docOpen, setDocOpen] = useState(null);
  const [endorsedOpen, setEndorsedOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null); // user-overridden active step
  const showToast = makeToaster(setToast);

  /* Close ⋯ menu on outside click */
  useEffect(() => {
    if (!openMenu) return;
    const onClick = (e) => { if (!e.target.closest('.row-menu, .row-menu-btn')) setOpenMenu(null); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [openMenu]);

  /* ─── Derived state ─── */
  const endorsedCount = useMemo(() => lanes.filter((l) => l.status === 'endorsed').length, [lanes]);
  const total = lanes.length;
  const blockedCount = Object.keys(flagged).length;
  /* Only actionable callouts (warn/info) count toward the gate; ok-tone are
     progress indicators and resolve themselves when their underlying state clears. */
  const openCalloutCount = FR_CALLOUTS.filter((c) => {
    if (resolvedCallouts[c.id]) return false;
    if (c.tone === 'ok') return false;            // progress indicators, not gating
    return true;
  }).length;
  const canRoute = endorsedCount === total && blockedCount === 0 && openCalloutCount === 0;

  /* Group lanes by attention priority */
  const groups = useMemo(() => {
    const attn = [], prog = [], done = [];
    for (const l of lanes) {
      if (flagged[l.id] || l.status === 'returned' || l.status === 'blocked') attn.push(l);
      else if (l.status === 'pending') prog.push(l);
      else done.push(l);
    }
    return { attn, prog, done };
  }, [lanes, flagged]);

  /* Sub-stepper — auto-derives focus, user can override by clicking */
  const derivedStep =
    groups.attn.length > 0 ? 'endorse'
    : endorsedCount < total ? 'endorse'
    : openCalloutCount > 0 ? 'callouts'
    : 'route';
  const currentStep = activeStep || derivedStep;
  const FR_STEPS = [
    { id: 'endorse',  num: 1, label: 'Endorse lanes' },
    { id: 'callouts', num: 2, label: 'Resolve callouts' },
    { id: 'route',    num: 3, label: 'Route to SRC' },
  ];
  const stepIdx = FR_STEPS.findIndex((s) => s.id === currentStep);

  /* ─── Actions ─── */
  const replaceReviewer = (laneId, altId) => {
    const alt = ALT_REVIEWERS[laneId]?.find((a) => a.id === altId);
    if (!alt) return;
    setLanes((p) => p.map((l) => l.id === laneId ? { ...l, who: alt.name, status: 'pending', sla: alt.sla } : l));
    setReplacing(null); setOpenMenu(null);
    showToast(`Reviewer reassigned to ${alt.name}.`);
  };
  const nudge = (laneId, who) => {
    setOpenMenu(null);
    setConfirm({
      tone: 'warn', title: `Send reminder to ${who}?`,
      body: 'They\'ll receive an in-app + email nudge with this PA\'s SLA status.',
      confirmLabel: 'Send nudge',
      onYes: () => { setNudged((p) => ({ ...p, [laneId]: true })); setConfirm(null); showToast(`Reminder sent to ${who}.`); },
    });
  };
  const startFlag = (laneId) => { setOpenFlag(laneId); setFlagNote(''); setOpenMenu(null); };
  const saveFlag = (laneId) => {
    const note = flagNote.trim() || 'Reviewer marked as blocked by CR.';
    setFlagged((p) => ({ ...p, [laneId]: note }));
    setLanes((p) => p.map((l) => l.id === laneId ? { ...l, status: 'blocked' } : l));
    setOpenFlag(null);
    showToast('Lane flagged as blocked. CD Manager notified.', 'warn');
  };
  const clearFlag = (laneId) => {
    setFlagged((p) => { const n = { ...p }; delete n[laneId]; return n; });
    setLanes((p) => p.map((l) => l.id === laneId ? { ...l, status: 'pending' } : l));
    setOpenMenu(null);
    showToast('Flag cleared. Lane returned to pending.');
  };
  const endorseFromAttn = (laneId) => {
    setLanes((p) => p.map((l) => l.id === laneId ? { ...l, status: 'endorsed', sla: 'now' } : l));
    showToast('Lane re-endorsed.');
  };
  const resolveCallout = (cId, action) => {
    setResolvedCallouts((p) => ({ ...p, [cId]: true }));
    showToast(`${action} — done.`);
  };

  /* Per-callout click — verb-based dispatch.
     Confirm only for state-changing verbs (Set, Apply, Reject, Override, Hand back, Delete).
     Open/View/Show verbs go directly to the resource. Generate fires inline. */
  const handleCalloutAction = (c) => {
    const verb = (c.action || '').trim().toLowerCase().split(' ')[0];
    const isDestructive = ['set', 'apply', 'reject', 'override', 'hand', 'delete', 'remove'].includes(verb);
    const isViewVerb = ['open', 'view', 'show', 'preview', 'inspect'].includes(verb);

    if (c.action.toLowerCase().includes('view progress')) {
      setActiveStep('route');
      return;
    }

    if (isViewVerb) {
      /* Open Schedule S/SM / View source / Open ownership matrix —
         show cited source AND mark the callout addressed (CR has taken the
         action by opening the resource). The modal also offers an explicit
         "Mark resolved" button if the CR wants to confirm separately. */
      const doc = CALLOUT_EVIDENCE[c.id];
      setEvid({
        ...doc,
        resolveText: <>By opening this source you are acknowledging the callout. <b>{c.action}</b> will be marked done.</>,
        resolveLabel: 'Mark resolved',
        onResolve: () => { resolveCallout(c.id, c.action); setEvid(null); },
      });
      /* Also auto-resolve immediately for streamlined UX — CR doesn't need
         to click twice. They can re-open the callout if they really didn't act. */
      resolveCallout(c.id, c.action);
      return;
    }

    if (isDestructive) {
      setConfirm({
        tone: c.tone === 'warn' ? 'warn' : undefined,
        title: c.action + '?',
        body: c.d,
        confirmLabel: c.action,
        onYes: () => { setConfirm(null); resolveCallout(c.id, c.action); },
      });
      return;
    }

    /* Generate / Draft / Send / Notify / etc — fire directly, mark resolved. */
    resolveCallout(c.id, c.action);
  };

  const routeToSlate = () => {
    if (!canRoute) return;
    setConfirm({
      title: 'Route to SRC and continue to slate?',
      body: 'Concurrence is complete. This locks the lane endorsements and advances the PA to Bid Slate assembly.',
      confirmLabel: 'Yes, route',
      onYes: () => {
        /* Canonical status advance — visible across Overview / Inbox / Reviews / Bidding */
        setPaStatus('PR-2026-04481', { status: PA_STATUS.BID_SLATE, pa: 'PA-LFPA-0218' });
        setConfirm(null);
        navigate('/bid-slate/PA-LFPA-0218');
      },
    });
  };

  /* ─── Address flow — decision-card modal so CR has clear choices, not 3 competing buttons ─── */
  const openAddress = (l) => {
    const ev = LANE_EVIDENCE[l.id] || {};
    setEvid({
      ...ev,
      decisionPrompt: 'What do you want to do about this?',
      decisionCards: [
        {
          icon: ICO.wand,
          tone: 'primary',
          recommended: true,
          title: 'Apply fix & re-route',
          sub: `Procura updates the PA per the required fix, then re-opens the ${l.name} lane for ${l.who} to re-review. Fastest path to endorsement.`,
          onClick: () => {
            setLanes((p) => p.map((x) => x.id === l.id ? { ...x, status: 'pending', sla: 'now', notes: 'Procura applied fix · re-routed to reviewer.' } : x));
            setEvid(null);
            showToast(`Fix applied to PA-LFPA-0218. ${l.name} lane re-opened for ${l.who}.`);
          },
        },
        {
          icon: ICO.handBack,
          tone: 'warn',
          title: 'Hand back to proponent',
          sub: 'Return the PR to the proponent (D&CE). They must update Schedule S/SM and re-submit before concurrence can resume. Use when the fix is outside CR scope.',
          onClick: () => {
            setLanes((p) => p.map((x) => x.id === l.id ? { ...x, status: 'returned' } : x));
            setEvid(null);
            showToast('PA handed back to proponent. Lane re-opens when proponent re-submits.', 'warn');
          },
        },
        {
          icon: ICO.shieldStar,
          tone: 'neutral',
          title: 'Override (CR authority)',
          sub: 'Endorse the lane on your authority despite the finding. Logged to the audit trail with your identity and a required justification. Use sparingly — visible to CD Manager.',
          onClick: () => {
            setLanes((p) => p.map((x) => x.id === l.id ? { ...x, status: 'endorsed', sla: 'CR override' } : x));
            setEvid(null);
            showToast(`${l.name} lane endorsed via CR override. Logged with your identity.`);
          },
        },
      ],
    });
  };

  /* ─── Sub-renderers ─── */
  const renderLaneRow = (l, variant = 'normal') => {
    const isFlagged = !!flagged[l.id];
    const isNudged = !!nudged[l.id];
    const isReplacing = replacing === l.id;
    const isFlagging = openFlag === l.id;
    const isMenuOpen = openMenu === l.id;
    const alts = ALT_REVIEWERS[l.id] || [];

    /* Primary action: ONE button surfaced based on status */
    let primary = null;
    if (variant === 'attn') {
      if (isFlagged) primary = { label: 'Clear flag', onClick: () => clearFlag(l.id) };
      else if (l.status === 'returned') primary = { label: 'Address', onClick: () => openAddress(l) };
    } else if (variant === 'prog') {
      primary = { label: isNudged ? 'Nudged' : 'Nudge', onClick: () => !isNudged && nudge(l.id, l.who), disabled: isNudged };
    }

    return (
      <div key={l.id} className={'lane-row v-' + variant + (isFlagged ? ' is-blocked' : '')}>
        <div className="lr-l">
          <div className={'lr-avatar st-' + l.status}>{l.who.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
          <div className="lr-id">
            <div className="lr-name">
              {l.name}
              <span className="lr-who"> · {l.who}</span>
              {isNudged && <span className="lr-tag is-nudged">nudged</span>}
            </div>
            {variant !== 'done' && (
              <div className="lr-note">{isFlagged ? flagged[l.id] : l.notes}</div>
            )}
          </div>
        </div>
        <div className="lr-r">
          <span className={'status-chip status-chip-combo ' + l.status + (l.sla === 'overdue' ? ' is-overdue' : '')}>
            <span className="sc-label">{LANE_STATUS_LABELS[l.status]}</span>
            <span className="sc-sep" aria-hidden="true"></span>
            <span className="sc-sla">{l.sla}</span>
          </span>
          {primary && (
            <button
              className={'pbtn xs ' + (variant === 'attn' ? 'primary' : '')}
              onClick={primary.onClick}
              disabled={primary.disabled}
            >{primary.label}</button>
          )}
          <button
            className="row-menu-btn"
            aria-label="More actions"
            onClick={(e) => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : l.id); }}
          >⋯</button>
          {isMenuOpen && (
            <div className="row-menu" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { setEvid(LANE_EVIDENCE[l.id]); setOpenMenu(null); }}>{ICO.eye} View source</button>
              {!isFlagged && (
                <>
                  {/* Manual endorse — CR can act on the reviewer's behalf (PA Draft "Override" pattern) */}
                  {l.status !== 'endorsed' && (
                    <button onClick={() => { endorseFromAttn(l.id); setOpenMenu(null); }}>{ICO.check} Endorse manually</button>
                  )}
                  <button onClick={() => { setReplacing(l.id); setOpenMenu(null); }}>{ICO.users} Replace reviewer</button>
                  {l.status === 'pending' && !isNudged && (
                    <button onClick={() => nudge(l.id, l.who)}>{ICO.send} Send nudge</button>
                  )}
                  {l.status === 'endorsed' && (
                    <button onClick={() => { setLanes((p) => p.map((x) => x.id === l.id ? { ...x, status: 'pending' } : x)); setOpenMenu(null); showToast('Endorsement withdrawn.'); }}>{ICO.flow} Withdraw endorsement</button>
                  )}
                  <div className="row-menu-sep"></div>
                  <button className="is-danger" onClick={() => startFlag(l.id)}>{ICO.shield} Flag as blocked</button>
                </>
              )}
              {isFlagged && (
                <button onClick={() => clearFlag(l.id)}>{ICO.check} Clear flag</button>
              )}
            </div>
          )}
        </div>
        {(isFlagging || isReplacing) && (
          <div className="lr-form">
            {isFlagging && (
              <div className="rd-flag-form">
                <input autoFocus placeholder="Reason this lane is blocked…" value={flagNote} onChange={(e) => setFlagNote(e.target.value)} />
                <button className="pbtn tiny" onClick={() => setOpenFlag(null)}>Cancel</button>
                <button className="pbtn tiny warn" onClick={() => saveFlag(l.id)}>Flag blocked</button>
              </div>
            )}
            {isReplacing && (
              <div className="rev-replace">
                <select onChange={(e) => e.target.value && replaceReviewer(l.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Replace with…</option>
                  {alts.filter((a) => a.name !== l.who).map((a) => (
                    <option key={a.id} value={a.id}>{a.name} · {a.sla}</option>
                  ))}
                </select>
                <button className="pbtn tiny ghost" onClick={() => setReplacing(null)}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="page">
      <div className="wrap">

        <PaHero
          pa={FR_HEADER.pa} title={FR_HEADER.title} value={FR_HEADER.value}
          track={FR_PA_META.track} proponent={FR_PA_META.proponent} dept={FR_PA_META.dept}
          notes={`CE ${FR_HEADER.ce} · ${FR_PA_META.notes}`}
          currentStage={CURRENT_STAGE} totalStages={LIFECYCLE_STAGES}
          stageLabel={STATUS_LABELS[PA_STATUS.FUNCTIONAL]}
          slaLeft={<><b>1.2d</b> left <span className="dim">· concurrence SLA</span></>}
          onViewPa={() => setDocOpen(PA_DOC)} onViewPrs={() => setDocOpen(PRS_DOC)}
          onOpenPaDraft={() => navigate('/pa-draft')}
          onViewPaDraftSnapshot={() => setDocOpen(PA_DRAFT_SUMMARY)}
        />

        <div className="wiz-stepper" role="tablist">
          {FR_STEPS.map((s, i) => {
            /* "done" = step is behind the derived progress; "active" = currently shown */
            const derivedIdx = FR_STEPS.findIndex((x) => x.id === derivedStep);
            const state = i === stepIdx ? 'active' : i < derivedIdx ? 'done' : 'next';
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === stepIdx}
                className={`wiz-step is-${state}`}
                onClick={() => setActiveStep(s.id)}
              >
                <span className="wiz-num">{state === 'done' ? '✓' : s.num}</span>
                <span className="wiz-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── STEP CONTENT — single active step rendered (PA Draft pattern) ── */}

        {currentStep === 'endorse' && (
        <div id="fr-endorse" className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="step-badge tone-blue" aria-hidden="true">
                <span className="sb-ic">{ICO.shield}</span>
              </div>
              <h3>Concurrence lanes</h3>
              <AiChip verb="polled lanes" ago="60s" />
              <InfoIcon openKey="lanes" currentOpen={openHelp} onToggle={setOpenHelp}>
                Each lane is a discipline that must endorse the PA before SRC route. Procura auto-assigns the named reviewer from each discipline&apos;s on-call roster by SLA performance. Lanes group by what needs your attention first: <b>Returned</b> &amp; <b>Blocked</b> on top (you must act), then <b>Pending</b> (waiting on others), then <b>Endorsed</b> (done — collapsed by default).
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (endorsedCount === total ? 'is-ok' : 'is-neutral')}>{endorsedCount}/{total} endorsed{blockedCount ? ` · ${blockedCount} blocked` : ''}</span>
          </div>

          <div className="panel-body" style={{ padding: 0 }}>
            {groups.attn.length > 0 && (
              <div className="lane-group is-attention">
                <div className="lg-head">
                  <span className="lg-title">Needs your attention</span>
                  <span className="chip-pill xs is-warn">{groups.attn.length}</span>
                </div>
                {groups.attn.map((l) => renderLaneRow(l, 'attn'))}
              </div>
            )}
            {groups.prog.length > 0 && (
              <div className="lane-group is-progress">
                <div className="lg-head">
                  <span className="lg-title">In progress</span>
                  <span className="chip-pill xs is-neutral">{groups.prog.length}</span>
                </div>
                {groups.prog.map((l) => renderLaneRow(l, 'prog'))}
              </div>
            )}
            {groups.done.length > 0 && (
              <div className={'lane-group is-done ' + (endorsedOpen ? 'is-open' : '')}>
                <button
                  type="button"
                  className="lg-head"
                  onClick={() => setEndorsedOpen((o) => !o)}
                  aria-expanded={endorsedOpen}
                >
                  <span className="lg-title">Endorsed</span>
                  <span className="chip-pill xs is-ok">{groups.done.length}</span>
                  <span className="lg-chev" aria-hidden="true">{ICO.arrowR}</span>
                </button>
                {endorsedOpen && groups.done.map((l) => renderLaneRow(l, 'done'))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── STEP 2 — callouts (simplified) ───────────────────── */}
        {currentStep === 'callouts' && (
        <div id="fr-callouts" className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="step-badge tone-teal" aria-hidden="true">
                <span className="sb-ic">{ICO.sparkle}</span>
              </div>
              <h3>Procura · review callouts</h3>
              <AiChip verb="generated" ago="2s" />
              <InfoIcon openKey="callouts" currentOpen={openHelp} onToggle={setOpenHelp}>
                Procura scans each lane note as it arrives and surfaces the actions a CR usually takes next. One primary action per callout. Tap the callout title to see the reviewer&apos;s exact source comment.
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (openCalloutCount === 0 ? 'is-ok' : 'is-warn')}>{openCalloutCount} open</span>
          </div>
          <div className="panel-body" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FR_CALLOUTS.map((c) => {
              /* Progress-indicator callouts (ok-tone) auto-resolve when the
                 underlying state clears. c3 specifically reflects lane endorsement count. */
              const isAutoResolved =
                c.tone === 'ok' && c.id === 'c3' && endorsedCount === total;
              const isResolved = isAutoResolved || !!resolvedCallouts[c.id];

              /* Live text for c3 — reflects current count instead of static "2 of 5" */
              let liveTitle = c.t;
              let liveDesc = c.d;
              if (c.id === 'c3') {
                liveTitle = `${endorsedCount} of ${total} lanes endorsed`;
                const remaining = total - endorsedCount;
                liveDesc = remaining === 0
                  ? 'All lanes endorsed. Route to SRC unlocked.'
                  : `${remaining} lane${remaining > 1 ? 's' : ''} still pending before SRC route.`;
              }

              return (
                <div key={c.id} className={`co-row ${c.tone} ${isResolved ? 'is-resolved' : ''}`}>
                  <div className={'co-row-ic tone-' + c.tone}>
                    {isResolved ? ICO.checkBold : (c.tone === 'warn' ? ICO.shield : c.tone === 'info' ? ICO.sparkle : ICO.check)}
                  </div>
                  <div className="co-row-body">
                    <button className="co-row-title" onClick={() => setEvid(CALLOUT_EVIDENCE[c.id])}>
                      {liveTitle}
                    </button>
                    <div className="co-row-sub">{liveDesc}</div>
                  </div>
                  <div className="co-row-action">
                    {isResolved ? (
                      <span className="status-chip endorsed">Resolved</span>
                    ) : (
                      <button
                        className={'pbtn xs ' + (c.tone === 'warn' ? 'primary' : '')}
                        onClick={() => handleCalloutAction(c)}
                      >{c.action}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* ── STEP 3 — uses .panel for visual uniformity with Steps 1/2 ── */}
        {currentStep === 'route' && (
        <div id="fr-route" className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className={'step-badge ' + (canRoute ? 'tone-green' : 'tone-amber')} aria-hidden="true">
                <span className="sb-ic">{canRoute ? ICO.checkBold : ICO.flow}</span>
              </div>
              <h3>Route to SRC</h3>
              <AiChip verb={canRoute ? 'cleared' : 'gating'} ago="just now" />
              <InfoIcon openKey="route" currentOpen={openHelp} onToggle={setOpenHelp}>
                Procura keeps the SRC route gated until all 5 concurrence lanes are endorsed, every callout is resolved, and no CR has flagged a blocking issue. Once the gate clears, routing locks the endorsements and advances the PA to Bid Slate assembly.
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (canRoute ? 'is-ok' : 'is-warn')}>{canRoute ? 'Ready' : 'Gated'}</span>
          </div>
          <div className="panel-body" style={{ padding: 18 }}>
            <div className={'gate-banner ' + (canRoute ? 'is-ready' : 'is-gated')}>
              <div className="gb-ic">{canRoute ? ICO.check : ICO.shield}</div>
              <div className="gb-body">
                <div className="gb-title">{canRoute ? 'Ready to route' : 'Gated — finish concurrence first'}</div>
                <div className="gb-sub">{canRoute
                  ? 'All preconditions met. Routing locks the endorsements and opens the bid slate.'
                  : 'Resolve the items below, then return here to route to SRC.'}</div>
              </div>
            </div>
            <ul className="gate-list">
              <li className={endorsedCount === total ? 'is-ok' : ''}>
                <span className="gl-ic">{endorsedCount === total ? ICO.check : <span className="gl-dot" />}</span>
                <span className="gl-label">All {total} lanes endorsed</span>
                <span className={'chip-pill xs ' + (endorsedCount === total ? 'is-ok' : 'is-neutral')}>{endorsedCount}/{total}</span>
              </li>
              <li className={openCalloutCount === 0 ? 'is-ok' : ''}>
                <span className="gl-ic">{openCalloutCount === 0 ? ICO.check : <span className="gl-dot" />}</span>
                <span className="gl-label">All callouts resolved</span>
                <span className={'chip-pill xs ' + (openCalloutCount === 0 ? 'is-ok' : 'is-warn')}>{openCalloutCount} open</span>
              </li>
              <li className={blockedCount === 0 ? 'is-ok' : ''}>
                <span className="gl-ic">{blockedCount === 0 ? ICO.check : <span className="gl-dot" />}</span>
                <span className="gl-label">No CR-flagged blocks</span>
                <span className={'chip-pill xs ' + (blockedCount === 0 ? 'is-ok' : 'is-warn')}>{blockedCount} flagged</span>
              </li>
            </ul>
          </div>
        </div>
        )}

        {/* ── PERSISTENT FOOTER ─────────────────────────────── */}
        <div className="step-foot">
          <div className="step-foot-l">
            <button
              className="pbtn ghost"
              onClick={() => stepIdx === 0 ? navigate('/reviews') : setActiveStep(FR_STEPS[stepIdx - 1].id)}
            >
              {ICO.arrowL}<span>{stepIdx === 0 ? 'Back to Reviews' : 'Back'}</span>
            </button>
          </div>
          <div className="step-foot-r">
            <button className="pbtn" onClick={() => showToast('Progress saved.')}>Save progress</button>
            {stepIdx < FR_STEPS.length - 1 ? (
              <button
                className="pbtn-premium"
                onClick={() => setActiveStep(FR_STEPS[stepIdx + 1].id)}
              >
                <span className="pbtn-premium-label">Continue</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            ) : (
              <button
                className="pbtn-premium"
                onClick={routeToSlate}
                disabled={!canRoute}
                title={canRoute ? 'All lanes endorsed — advance to slate' : `${total - endorsedCount} lane(s) and ${openCalloutCount} callout(s) still pending`}
              >
                <span className="pbtn-premium-label">{canRoute ? 'Route to SRC & open slate' : `Route to SRC (${total - endorsedCount + openCalloutCount + blockedCount} blocking)`}</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <EvidenceModal doc={evid} onClose={() => setEvid(null)} />
      <EvidenceModal doc={docOpen} onClose={() => setDocOpen(null)} />
      <Toast toast={toast} />
    </div>
  );
}
