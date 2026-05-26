import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { BE_HEADER, BE_BIDDERS, BE_CALLOUTS } from '../data/constants';
import { AiChip, InfoIcon, ConfirmModal, Toast, EvidenceModal, PaHero, makeToaster } from '../components/WizardKit';
import { PA_STATUS, STATUS_LABELS, setPaStatus } from '../lib/paStatus';

/* Bidder tiering — derived from composite score + flags */
function tierOf(b) {
  if (b.flags?.length >= 2) return 'risk';
  if (b.score >= 90) return 'lead';
  if (b.score >= 80) return 'contender';
  return 'risk';
}
const TIER_META = {
  lead:      { label: 'Lead candidate',      sub: 'Composite ≥ 90 · CR-favourable',         tone: 'ok',     emoji: '★' },
  contender: { label: 'In contention',       sub: 'Composite 80-89 · viable alternates',    tone: 'info',   emoji: '◆' },
  risk:      { label: 'Below threshold',     sub: 'Composite < 80 or compliance concerns',  tone: 'warn',   emoji: '⚠' },
};

/* Premium ring-gauge metric. tone = blue|teal|green|amber. small for bidder cards. */
function BidderMetric({ label, value, max = 100, tone = 'blue', suffix = '', small }) {
  const pct = Math.min(100, (value / max) * 100);
  const size = small ? 56 : 72;
  const stroke = small ? 5 : 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className={'bg ' + (small ? 'is-small' : '') + ' tone-' + tone}>
      <div className="bg-ring" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          <circle cx={size/2} cy={size/2} r={r} className="bg-ring-track" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} className="bg-ring-fill" strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        </svg>
        <div className="bg-ring-num">
          <span className="bg-ring-val">{value}</span>
          {suffix && <span className="bg-ring-suf">{suffix.replace('/100','').replace('%','%')}</span>}
        </div>
      </div>
      <div className="bg-label">{label}</div>
    </div>
  );
}

const BE_PA_META = {
  track: 'LFPA · MP-IK-LSTK · SRC route',
  proponent: 'Ahmed Al-Mahmoud',
  dept: 'D&CE',
  value: '$68.4M',
};
const BE_PA_DOC = {
  eyebrow: 'Document · RFP issued · 6 bidders responded',
  title: 'PA-LFPA-0218 — Jubail Hookup & Commissioning Phase 3',
  sections: [{ h: 'Status', p: 'Bid window closed 09:00 today. 6 of 6 sealed envelopes opened by BOC. Composite ranking is live below.' }],
};
const BE_PRS_DOC = {
  eyebrow: 'Source · PR Strategy doc · PRS-2026-0218',
  title: 'PR Strategy — PR-2026-04481',
  sections: [{ h: 'Award criteria', p: '50% Tech · 25% IKTVA · 25% Commercial (CE-normalised). CE +5% memo required if low bid >5% over.' }],
};

/* Evidence per bidder — what the score is grounded in. */
const BIDDER_EVIDENCE = {
  B1: { eyebrow: 'Source · BRT technical pass · IRT IKTVA review · commercial envelope', title: 'ZahidEng JV — composite 92',
        sections: [
          { h: 'Tech score (96)', p: 'BRT scored 96/100 (Lead). All 47 spec items pass. Method statement rated "exemplary" on three out of five evaluation criteria.' },
          { h: 'IKTVA (84%)', p: 'IRT verified IKTVA 84% — best technical bidder. Saudization commitment 22%, in-Kingdom spend $1.42B verified Q1.' },
          { h: 'Commercial ($62.4M)', p: 'Sealed envelope opened 09:31 today. Bid +3.7% vs CE — within normal range, no CE memo required.' },
        ], quote: '"BRT and IRT both rank ZahidEng JV first. Bid is within CE band." — BRT chair' },
  B2: { eyebrow: 'Source · BRT · IRT · commercial envelope', title: 'Al-Yamamah Steel — composite 88',
        sections: [{ h: 'Summary', p: 'Tech 90 · IKTVA 78 · Bid $64.1M (+6.5% vs CE). CE +5% memo required if shortlisted.' }] },
  B3: { eyebrow: 'Source · BRT · IRT · commercial envelope', title: 'NPCC KSA — composite 85',
        sections: [{ h: 'Summary', p: 'Tech 88 · IKTVA 81 · Bid $65.7M (+9.1%). CE +5% memo required. Highest IKTVA in commercial pool.' }] },
  B4: { eyebrow: 'Source · ownership matrix · BRT · IRT · commercial', title: 'Saipem Taqa — composite 83',
        sections: [
          { h: 'Tech (92)', p: 'Strong technical bid.' },
          { h: 'IKTVA / OOK concerns', p: 'IKTVA 64% (below 65% floor). OOK 56% — exceeds 50% threshold, triggers §5.4.13 ownership review.' },
        ] },
  B5: { eyebrow: 'Source · BRT · IRT', title: 'Sinopec MEC — composite 76',
        sections: [{ h: 'Concern', p: 'Tech 85 · IKTVA 58 (well below floor). Procura recommends disqualification unless geographic-coverage rationale.' }] },
  B6: { eyebrow: 'Source · commercial envelope', title: 'JGC Gulf — composite 72',
        sections: [{ h: 'Concern', p: 'Tech 84 · IKTVA 55 · Bid +13% vs CE. Procura recommends disqualification.' }] },
};

const CALLOUT_EVIDENCE = {
  0: { eyebrow: 'Source · §5.4.10 — CE +5% rule', title: 'CE +5% memo template',
       sections: [{ h: 'What this does', p: 'Generates the standard CE +5% justification memo for any bid 5-10% above sealed CE. Memo is pre-filled with bidder identity, deviation %, and CE reference.' }] },
  1: { eyebrow: 'Source · IKTVA ownership matrix · Q1 2026', title: 'B2 / B4 ownership overlap',
       sections: [{ h: 'Overlap detail', p: 'Al-Yamamah Steel (B2) and Saipem Taqa (B4) share 56% beneficial ownership through a common holding company. Both bidders must disclose under §5.4.13 before composite ranking finalises.' }] },
};

export default function BidEvaluation() {
  const navigate = useNavigate();

  const [shortlisted, setShortlisted] = useState({ B1: true }); // lead pre-shortlisted
  const [dq, setDq] = useState({});
  const [flagged, setFlagged] = useState({});
  const [openFlag, setOpenFlag] = useState(null);
  const [flagNote, setFlagNote] = useState('');
  const [openHelp, setOpenHelp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [evid, setEvid] = useState(null);
  const [resolvedCallouts, setResolvedCallouts] = useState({});
  const [activeStep, setActiveStep] = useState(null);
  const [profile, setProfile] = useState(null);          // bidder profile drill modal
  const [dqReasonOpen, setDqReasonOpen] = useState(null); // bidder id getting DQ'd
  const [dqReason, setDqReason] = useState('');

  const showToast = makeToaster(setToast);

  const slCount = useMemo(() => Object.keys(shortlisted).length, [shortlisted]);
  const dqCount = useMemo(() => Object.keys(dq).length, [dq]);
  const openCalloutCount = BE_CALLOUTS.filter((_, i) => !resolvedCallouts[i]).length;
  const canCompile = slCount >= 1;

  /* Tier-group the bidders for the new card layout. Lead bidder = highest-composite
     non-DQ shortlisted (or just highest if none shortlisted yet). */
  const tierGroups = useMemo(() => {
    const sorted = [...BE_BIDDERS].sort((a, b) => b.score - a.score);
    const groups = { lead: [], contender: [], risk: [] };
    sorted.forEach((b) => { if (!dq[b.id]) groups[tierOf(b)].push(b); });
    return groups;
  }, [dq]);

  const leadBidder = useMemo(() => {
    const shortlistedSorted = BE_BIDDERS
      .filter((b) => shortlisted[b.id] && !dq[b.id])
      .sort((a, b) => b.score - a.score);
    if (shortlistedSorted.length) return shortlistedSorted[0];
    return [...BE_BIDDERS].filter((b) => !dq[b.id]).sort((a, b) => b.score - a.score)[0];
  }, [shortlisted, dq]);


  /* Sub-stepper */
  const BE_STEPS = [
    { id: 'callouts', num: 1, label: 'Resolve callouts' },
    { id: 'ranking',  num: 2, label: 'Composite ranking' },
    { id: 'compile',  num: 3, label: 'Compile packet' },
  ];
  const derivedStep = openCalloutCount > 0 ? 'callouts' : slCount < 1 ? 'ranking' : 'compile';
  const currentStep = activeStep || derivedStep;
  const stepIdx = BE_STEPS.findIndex((s) => s.id === currentStep);

  const toggleShortlist = (id) => {
    if (dq[id]) return;
    setShortlisted((p) => {
      const n = { ...p }; if (n[id]) delete n[id]; else n[id] = true; return n;
    });
    showToast(shortlisted[id] ? 'Removed from shortlist.' : 'Added to shortlist.');
  };

  const startDq = (id) => { setDqReasonOpen(id); setDqReason(''); };
  const saveDq = (id, name) => {
    const reason = dqReason.trim() || 'CR disqualified — no reason provided.';
    setDq((p) => ({ ...p, [id]: reason }));
    setShortlisted((p) => { const n = { ...p }; delete n[id]; return n; });
    setDqReasonOpen(null);
    showToast(`${name} disqualified.`, 'warn');
  };

  const startFlag = (id) => { setOpenFlag(id); setFlagNote(''); };
  const saveFlag = (id) => {
    const note = flagNote.trim() || 'CR flagged a concern on this bid.';
    setFlagged((p) => ({ ...p, [id]: note }));
    setOpenFlag(null);
    showToast('Concern logged. Visible on the award packet.', 'warn');
  };
  const clearFlag = (id) => {
    setFlagged((p) => { const n = { ...p }; delete n[id]; return n; });
    showToast('Concern cleared.');
  };

  const compile = () => {
    if (!canCompile) return;
    setConfirm({
      title: `Compile award packet for ${slCount} shortlisted bidder${slCount > 1 ? 's' : ''}?`,
      body: `Award packet will include: composite ranking, BRT/IRT verdicts, CE comparison, any CR concerns logged. ${dqCount} disqualified bidder${dqCount > 1 ? 's' : ''} will be excluded. Proceeds to Award & Sign.`,
      confirmLabel: 'Compile packet',
      onYes: () => {
        setPaStatus('PR-2026-04481', { status: PA_STATUS.AWARD_SIGN });
        setConfirm(null);
        navigate('/award-sign');
      },
    });
  };

  return (
    <div className="page">
      <div className="wrap">

        <PaHero
          pa={BE_HEADER.pa}
          title={BE_HEADER.title}
          value={BE_PA_META.value}
          track={BE_PA_META.track}
          proponent={BE_PA_META.proponent}
          dept={BE_PA_META.dept}
          notes={`${BE_HEADER.bidders} bidders · ${BE_HEADER.envelopes} · CE $${BE_HEADER.ce}M sealed`}
          currentStage={6}
          totalStages={7}
          stageLabel={STATUS_LABELS[PA_STATUS.BID_EVAL]}
          slaLeft={<><b>3d</b> left <span className="dim">· composite SLA</span></>}
          onViewPa={() => setEvid(BE_PA_DOC)}
          onViewPrs={() => setEvid(BE_PRS_DOC)}
        />

        {/* ── SUB-STEPPER ──────────────────────────────────────── */}
        <div className="wiz-stepper" role="tablist">
          {BE_STEPS.map((s, i) => {
            const dIdx = BE_STEPS.findIndex((x) => x.id === derivedStep);
            const state = s.id === currentStep ? 'active' : i < dIdx ? 'done' : 'next';
            return (
              <button key={s.id} className={`wiz-step is-${state}`} onClick={() => setActiveStep(s.id)}>
                <span className="wiz-num">{state === 'done' ? '✓' : s.num}</span>
                <span className="wiz-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── STEP 1 · CALLOUTS ────────────────────────────────── */}
        {currentStep === 'callouts' && (
        <div className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="step-badge tone-amber" aria-hidden="true">
                <span className="sb-ic">{ICO.sparkle}</span>
              </div>
              <h3>Procura · review callouts</h3>
              <AiChip verb="generated" ago="2s" />
              <InfoIcon openKey="becallouts" currentOpen={openHelp} onToggle={setOpenHelp}>
                Procura surfaces commercial and ownership concerns the moment envelopes open. Resolve each before composite ranking is finalised. Warn-tone callouts confirm; view-only verbs go direct.
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (openCalloutCount === 0 ? 'is-ok' : 'is-warn')}>{openCalloutCount} open</span>
          </div>
          <div className="panel-body" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BE_CALLOUTS.map((c, i) => {
              const isResolved = !!resolvedCallouts[i];
              return (
                <div key={i} className={`co-row ${c.tone} ${isResolved ? 'is-resolved' : ''}`}>
                  <div className={'co-row-ic tone-' + c.tone}>{isResolved ? ICO.checkBold : c.tone === 'warn' ? ICO.shield : ICO.sparkle}</div>
                  <div className="co-row-body">
                    <button className="co-row-title" onClick={() => setEvid(CALLOUT_EVIDENCE[i])}>{c.t}</button>
                    <div className="co-row-sub">{c.d}</div>
                  </div>
                  <div className="co-row-action">
                    {isResolved ? <span className="status-chip endorsed">Resolved</span> : (
                      <button
                        className={'pbtn xs ' + (c.tone === 'warn' ? 'primary' : '')}
                        onClick={() => {
                          const verb = (c.action || '').trim().toLowerCase().split(' ')[0];
                          if (['open', 'view', 'show'].includes(verb)) { setEvid(CALLOUT_EVIDENCE[i]); return; }
                          if (['set', 'apply', 'reject', 'override'].includes(verb)) {
                            setConfirm({ tone: 'warn', title: c.action + '?', body: c.d, confirmLabel: c.action,
                              onYes: () => { setResolvedCallouts((p) => ({ ...p, [i]: true })); setConfirm(null); showToast(`${c.action} — done.`); } });
                            return;
                          }
                          setResolvedCallouts((p) => ({ ...p, [i]: true }));
                          showToast(`${c.action} — done.`);
                        }}
                      >{c.action}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* ── STEP 2 · COMPOSITE RANKING ───────────────────────── */}
        {currentStep === 'ranking' && (
        <>
          {/* Lead bidder hero — Procura's primary recommendation */}
          {leadBidder && (
            <div className={'lead-hero ' + (shortlisted[leadBidder.id] ? 'is-shortlisted' : '')}>
              <div className="lh-rank">
                <div className="lh-rank-trophy">{ICO.medal}</div>
                <div className="lh-rank-tier">Lead candidate</div>
                <div className="lh-rank-eyebrow">Procura recommendation</div>
              </div>
              <div className="lh-body">
                <div className="lh-id">
                  <span className="bid-id">{leadBidder.id}</span>
                  <h3>{leadBidder.name}</h3>
                  <AiChip verb="ranked" ago="just now" />
                </div>
                <div className="lh-reason">
                  <div className="lh-reason-head">Why this bidder</div>
                  <div className="lh-reason-row">
                    <span className="lh-rsn-chip"><span className="lh-rsn-k">Composite</span><span className="lh-rsn-v">{leadBidder.score}/100 · highest</span></span>
                    <span className="lh-rsn-chip"><span className="lh-rsn-k">Tech</span><span className="lh-rsn-v">{leadBidder.tech} · best in field</span></span>
                    <span className="lh-rsn-chip"><span className="lh-rsn-k">IKTVA</span><span className="lh-rsn-v">{leadBidder.iktva}% · {leadBidder.iktva >= 65 ? 'above floor' : 'review required'}</span></span>
                    <span className="lh-rsn-chip"><span className="lh-rsn-k">Bid</span><span className="lh-rsn-v">${leadBidder.comm.toFixed(1)}M · {leadBidder.dev} vs CE</span></span>
                    <span className={'lh-rsn-chip ' + (parseFloat(leadBidder.dev) < 5 ? 'is-ok' : 'is-warn')}>
                      <span className="lh-rsn-k">CE band</span><span className="lh-rsn-v">{parseFloat(leadBidder.dev) < 5 ? 'within band · no memo' : 'CE +5% memo'}</span>
                    </span>
                  </div>
                </div>
                <div className="lh-metrics">
                  <BidderMetric label="Tech" value={leadBidder.tech} max={100} tone="blue" suffix="/100" />
                  <BidderMetric label="IKTVA" value={leadBidder.iktva} max={100} tone="teal" suffix="%" />
                  <BidderMetric label="Composite" value={leadBidder.score} max={100} tone="green" suffix="/100" />
                </div>
              </div>
              <div className="lh-action">
                {!shortlisted[leadBidder.id] ? (
                  <button className="pbtn-premium" onClick={() => toggleShortlist(leadBidder.id)}>
                    <span className="pbtn-premium-label">★ Shortlist as winner</span>
                  </button>
                ) : (
                  <button className="lh-shortlisted-btn" onClick={() => toggleShortlist(leadBidder.id)} title="Click to remove from shortlist">
                    <span className="lh-sl-tick">✓</span>
                    <span className="lh-sl-label">Shortlisted</span>
                    <span className="lh-sl-undo">Undo</span>
                  </button>
                )}
                <button className="lh-secondary-btn" onClick={() => setProfile(leadBidder)}>
                  View full profile
                  <span aria-hidden="true">{ICO.chevR}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tier-grouped bidder cards */}
          <div className="panel">
            <div className="panel-head">
              <div className="ph-l">
                <div className="step-badge tone-blue" aria-hidden="true">
                  <span className="sb-ic">{ICO.stats}</span>
                </div>
                <h3>All bidders · grouped by tier</h3>
                <AiChip verb="tiered" ago="2s" />
                <InfoIcon openKey="rank" currentOpen={openHelp} onToggle={setOpenHelp}>
                  Procura groups bidders by composite tier: <b>Lead</b> (≥90), <b>In contention</b> (80-89), <b>Below threshold</b> (&lt;80 or 2+ compliance flags). Composite = 50% Tech · 25% IKTVA · 25% Commercial. Click any bidder for the full profile breakdown.
                </InfoIcon>
              </div>
              <span className="chip-pill is-neutral">{BE_BIDDERS.length - dqCount} active · {dqCount} DQ</span>
            </div>

            <div className="panel-body" style={{ padding: 0 }}>
              {['lead', 'contender', 'risk'].map((tier) => {
                const list = tierGroups[tier];
                if (list.length === 0) return null;
                const meta = TIER_META[tier];
                return (
                  <div key={tier} className={'tier-group is-' + tier}>
                    <div className="tg-head">
                      <span className="tg-emoji">{meta.emoji}</span>
                      <span className="tg-title">{meta.label}</span>
                      <span className="tg-sub">{meta.sub}</span>
                      <span className={'chip-pill xs is-' + meta.tone} style={{ marginLeft: 'auto' }}>{list.length}</span>
                    </div>
                    <div className="bidder-cards">
                      {list.map((b) => {
                        const isSl = !!shortlisted[b.id];
                        const isFlagged = !!flagged[b.id];
                        const isFlagging = openFlag === b.id;
                        const isDqReason = dqReasonOpen === b.id;
                        const over = b.dev.startsWith('+') && parseFloat(b.dev) >= 5;
                        return (
                          <div key={b.id} className={'bidder-card ' + (isSl ? 'is-shortlisted' : '')}>
                            <button
                              className="bc-main"
                              onClick={() => setProfile(b)}
                              title="Open full profile"
                            >
                              <div className="bc-id">
                                <span className="bid-id">{b.id}</span>
                                <div className="bc-id-row">
                                  <span className="bc-name">{b.name}</span>
                                  {isSl && <span className="bc-star" title="Shortlisted">★</span>}
                                </div>
                              </div>
                              <div className="bc-metrics">
                                <BidderMetric label="Tech" value={b.tech} max={100} tone="blue" small />
                                <BidderMetric label="IKTVA" value={b.iktva} max={100} tone="teal" suffix="%" small />
                                <BidderMetric label="Composite" value={b.score} max={100} tone={tier === 'lead' ? 'green' : tier === 'contender' ? 'blue' : 'amber'} small />
                              </div>
                              <div className="bc-commercial">
                                <div className="bc-bid">${b.comm.toFixed(1)}M</div>
                                <div className={'bc-dev ' + (over ? 'over' : 'ok')}>{b.dev} vs CE</div>
                              </div>
                              {b.flags.length > 0 && (
                                <div className="bc-flags">
                                  {b.flags.map((f) => <span key={f} className="flag-pill">{f}</span>)}
                                </div>
                              )}
                            </button>
                            <div className="bc-actions">
                              <button
                                className={'pbtn xs ' + (isSl ? '' : 'primary')}
                                onClick={() => toggleShortlist(b.id)}
                              >{isSl ? '★ Remove' : '★ Shortlist'}</button>
                              <button className="pbtn xs ghost" onClick={() => startFlag(b.id)}>
                                {isFlagged ? 'Update concern' : 'Flag concern'}
                              </button>
                              <button className="pbtn xs ghost warn-text" onClick={() => startDq(b.id)}>Disqualify</button>
                            </div>
                            {isFlagging && (
                              <div className="bc-form">
                                <input
                                  autoFocus
                                  placeholder={`Concern about ${b.name} — visible on award packet…`}
                                  value={flagNote}
                                  onChange={(e) => setFlagNote(e.target.value)}
                                />
                                <button className="pbtn xs" onClick={() => setOpenFlag(null)}>Cancel</button>
                                <button className="pbtn xs warn" onClick={() => saveFlag(b.id)}>Log concern</button>
                              </div>
                            )}
                            {isFlagged && !isFlagging && (
                              <div className="bc-note"><b>Concern logged:</b> {flagged[b.id]} <button className="link-btn" onClick={() => clearFlag(b.id)}>Clear</button></div>
                            )}
                            {isDqReason && (
                              <div className="bc-form">
                                <input
                                  autoFocus
                                  placeholder={`Reason for disqualifying ${b.name} (required — auto-drafted into unsuccessful-bidder letter)…`}
                                  value={dqReason}
                                  onChange={(e) => setDqReason(e.target.value)}
                                />
                                <button className="pbtn xs" onClick={() => setDqReasonOpen(null)}>Cancel</button>
                                <button className="pbtn xs warn" onClick={() => saveDq(b.id, b.name)} disabled={!dqReason.trim()}>Confirm DQ</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Disqualified — collapsed at bottom */}
              {dqCount > 0 && (
                <details className="tier-group is-dq">
                  <summary className="tg-head">
                    <span className="tg-emoji">✕</span>
                    <span className="tg-title">Disqualified</span>
                    <span className="tg-sub">Excluded from award packet · unsuccessful-bidder letter auto-drafted</span>
                    <span className="chip-pill xs is-neutral" style={{ marginLeft: 'auto' }}>{dqCount}</span>
                  </summary>
                  <div className="bidder-cards">
                    {BE_BIDDERS.filter((b) => dq[b.id]).map((b) => (
                      <div key={b.id} className="bidder-card is-dq-compact">
                        <div className="bc-id">
                          <span className="bid-id">{b.id}</span>
                          <span className="bc-name">{b.name}</span>
                        </div>
                        <div className="bc-note"><b>DQ reason:</b> {dq[b.id]}</div>
                        <button className="pbtn xs ghost" onClick={() => { setDq((p) => { const n = { ...p }; delete n[b.id]; return n; }); showToast(`${b.name} reinstated.`); }}>Reinstate</button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </>
        )}

        {/* ── STEP 3 · COMPILE PACKET ──────────────────────────── */}
        {currentStep === 'compile' && (
        <div className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className={'step-badge ' + (canCompile ? 'tone-green' : 'tone-amber')} aria-hidden="true">
                <span className="sb-ic">{canCompile ? ICO.checkBold : ICO.paper}</span>
              </div>
              <h3>Compile award packet</h3>
              <AiChip verb={canCompile ? 'cleared' : 'gating'} ago="just now" />
              <InfoIcon openKey="compile" currentOpen={openHelp} onToggle={setOpenHelp}>
                Compiling locks the composite ranking and bundles shortlisted bidders + BRT/IRT verdicts + CE comparison + CR concerns into the SRC packet. Disqualified bidders are auto-excluded.
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (canCompile ? 'is-ok' : 'is-warn')}>{canCompile ? 'Ready' : 'Gated'}</span>
          </div>
          <div className="panel-body" style={{ padding: 18 }}>
            <div className={'gate-banner ' + (canCompile ? 'is-ready' : 'is-gated')}>
              <div className="gb-ic">{canCompile ? ICO.checkBold : ICO.shield}</div>
              <div className="gb-body">
                <div className="gb-title">{canCompile ? `Ready to compile award packet for ${slCount} shortlisted bidder${slCount > 1 ? 's' : ''}` : 'Gated — shortlist at least 1 bidder'}</div>
                <div className="gb-sub">{canCompile ? `${dqCount} disqualified bidder${dqCount !== 1 ? 's' : ''} will be excluded. Proceeds to Award & Sign.` : 'Open Step 2 and shortlist your lead candidate(s) using the ★ Shortlist action.'}</div>
              </div>
            </div>
            <ul className="gate-list">
              <li className={slCount >= 1 ? 'is-ok' : ''}>
                <span className="gl-ic">{slCount >= 1 ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">At least 1 bidder shortlisted</span>
                <span className={'chip-pill xs ' + (slCount >= 1 ? 'is-ok' : 'is-warn')}>{slCount} shortlisted</span>
              </li>
              <li className={openCalloutCount === 0 ? 'is-ok' : ''}>
                <span className="gl-ic">{openCalloutCount === 0 ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">All callouts resolved</span>
                <span className={'chip-pill xs ' + (openCalloutCount === 0 ? 'is-ok' : 'is-warn')}>{openCalloutCount} open</span>
              </li>
              <li className={dqCount > 0 ? 'is-ok' : ''}>
                <span className="gl-ic">{dqCount > 0 ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">Non-conformant bids actioned</span>
                <span className={'chip-pill xs ' + (dqCount > 0 ? 'is-ok' : 'is-neutral')}>{dqCount} DQ</span>
              </li>
            </ul>

            {/* Auto-generated award rationale memo preview */}
            {canCompile && leadBidder && shortlisted[leadBidder.id] && (
              <div className="award-memo">
                <div className="am-head">
                  <div className="am-eyebrow">
                    <AiChip verb="drafted" ago="just now" />
                    <span>Award memo · draft preview</span>
                  </div>
                  <button className="link-btn" onClick={() => showToast('Memo opened in editor.')}>Edit memo →</button>
                </div>
                <div className="am-body">
                  <p>Following commercial evaluation of {BE_BIDDERS.length} bidders against PA-LFPA-{BE_HEADER.pa.split('-').pop()}
                  ({BE_HEADER.title}), Procurement recommends <b>{leadBidder.name}</b> ({leadBidder.id}) for award.</p>

                  <p><b>Rationale:</b> {leadBidder.name} achieved the highest composite score
                  ({leadBidder.score}/100), leading on Tech ({leadBidder.tech}/100) and meeting the
                  IKTVA floor at {leadBidder.iktva}%. Commercial bid of <b>${leadBidder.comm.toFixed(1)}M</b> sits
                  {parseFloat(leadBidder.dev) < 5 ? ' within the CE band' : ' above CE — memo §5.4.10 attached'}
                  {' '}({leadBidder.dev} vs CE ${BE_HEADER.ce}M sealed).</p>

                  {dqCount > 0 && (
                    <p><b>Excluded bidders ({dqCount}):</b> {BE_BIDDERS.filter((b) => dq[b.id]).map((b) => b.name).join(', ')}.
                    Unsuccessful-bidder letters auto-drafted with the disqualification reason on file.</p>
                  )}

                  <p><b>SRC route:</b> PA value ${(parseFloat(BE_PA_META.value.replace(/[^0-9.]/g, ''))).toFixed(1)}M
                  exceeds $50M threshold — Senior Review Committee approval required before NoA issuance.</p>

                  <div className="am-sig">
                    <div>Drafted by Procura · {leadBidder.name} recommended</div>
                    <div>For CR signature: Mohammed Al-Ghamdi · CD-PSCM</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ── PERSISTENT FOOTER (step-aware) ────────────────── */}
        <div className="step-foot">
          <div className="step-foot-l">
            <button
              className="pbtn ghost"
              onClick={() => stepIdx === 0 ? navigate('/bid-slate/' + BE_HEADER.pa) : setActiveStep(BE_STEPS[stepIdx - 1].id)}
            >
              {ICO.arrowL}<span>{stepIdx === 0 ? 'Back to Bid Slate' : 'Back'}</span>
            </button>
          </div>
          <div className="step-foot-r">
            <button className="pbtn" onClick={() => showToast('Ranking exported.')}><span>{ICO.download}</span>Export ranking</button>
            {stepIdx < BE_STEPS.length - 1 ? (
              <button className="pbtn-premium" onClick={() => setActiveStep(BE_STEPS[stepIdx + 1].id)}>
                <span className="pbtn-premium-label">Continue</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            ) : (
              <button
                className="pbtn-premium"
                disabled={!canCompile}
                onClick={compile}
                title={canCompile ? 'Compile award packet' : 'Shortlist at least one bidder first'}
              >
                <span className="pbtn-premium-label">Compile award packet ({slCount})</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <EvidenceModal doc={evid} onClose={() => setEvid(null)} />

      {/* Bidder profile drill modal */}
      {profile && (
        <div className="doc-modal" onClick={() => setProfile(null)}>
          <div className="doc-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-head">
              <div>
                <div className="doc-modal-eyebrow">Bidder profile · {profile.id}</div>
                <h2>{profile.name}</h2>
                <div className="doc-issued">Composite {profile.score}/100 · Bid ${profile.comm.toFixed(1)}M ({profile.dev} vs CE)</div>
              </div>
              <button className="doc-modal-close" onClick={() => setProfile(null)} aria-label="Close">✕</button>
            </div>
            <div className="doc-modal-body">
              <div className="bp-grid">
                <div className="bp-stat">
                  <BidderMetric label="Tech score" value={profile.tech} max={100} tone="blue" suffix="/100" />
                  <div className="bp-sub">BRT verdict · 47 spec items reviewed</div>
                </div>
                <div className="bp-stat">
                  <BidderMetric label="IKTVA" value={profile.iktva} max={100} tone="teal" suffix="%" />
                  <div className="bp-sub">{profile.iktva >= 65 ? '✓ Above 65% floor' : '⚠ Below 65% floor'}</div>
                </div>
                <div className="bp-stat">
                  <BidderMetric label="Composite" value={profile.score} max={100} tone="green" suffix="/100" />
                  <div className="bp-sub">50% Tech · 25% IKTVA · 25% Commercial</div>
                </div>
              </div>

              <div className="doc-sec">
                <h4>Commercial breakdown</h4>
                <p>Bid: <b>${profile.comm.toFixed(1)}M</b> · Deviation: <b>{profile.dev}</b> vs CE (${BE_HEADER.ce}M sealed). {parseFloat(profile.dev) >= 5 ? 'CE +5% memo required if shortlisted (auto-drafted on award).' : 'Within normal range — no CE memo required.'}</p>
              </div>

              {profile.flags.length > 0 && (
                <div className="doc-sec">
                  <h4>Compliance flags</h4>
                  <p>{profile.flags.join(' · ')}. Procura recommends review before shortlisting.</p>
                </div>
              )}

              <div className="doc-sec">
                <h4>BRT &amp; IRT verdicts</h4>
                {BIDDER_EVIDENCE[profile.id]?.sections.map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}><b>{s.h}.</b> {s.p}</div>
                ))}
              </div>

              {BIDDER_EVIDENCE[profile.id]?.quote && (
                <div className="doc-sec"><blockquote className="doc-quote">{BIDDER_EVIDENCE[profile.id].quote}</blockquote></div>
              )}
            </div>
            <div className="doc-modal-foot">
              <div style={{ flex: 1 }}></div>
              <div className="doc-foot-actions">
                <button className="pbtn ghost" onClick={() => setProfile(null)}>Close</button>
                {!shortlisted[profile.id] && !dq[profile.id] && (
                  <button className="pbtn-premium" onClick={() => { toggleShortlist(profile.id); setProfile(null); }}>
                    <span className="pbtn-premium-label">★ Shortlist</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
