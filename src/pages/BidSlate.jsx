import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { BS_HEADER, BS_POOL, BS_PACKAGE } from '../data/constants';
import { AiChip, InfoIcon, ConfirmModal, Toast, EvidenceModal, PaHero, makeToaster } from '../components/WizardKit';
import { PA_STATUS, STATUS_LABELS, setPaStatus } from '../lib/paStatus';

const BS_PA_META = {
  track: 'LFPA · MP-IK-LSTK · SRC route',
  proponent: 'Ahmed Al-Mahmoud',
  dept: 'D&CE',
  value: '$68.4M',
};
const BS_PA_DOC = {
  eyebrow: 'Document · PA snapshot · ready for RFP',
  title: `${BS_HEADER ? '' : ''}PA approved — assembling slate`,
  sections: [{ h: 'Status', p: 'PA endorsed in Functional Review. RFP package being compiled for the qualified vendor pool.' }],
};
const BS_PRS_DOC = {
  eyebrow: 'Source · PR Strategy doc · PRS-2026-0218',
  title: 'PR Strategy — PR-2026-04481',
  sections: [{ h: 'Selection rationale', p: 'IKTVA ≥65% filter, MP-LSTK pool, 14-day RFP window, 7-day Q&A. Slate to be issued after CR confirms package.' }],
};

/* Evidence per vendor — what Procura cited from the qualification file. */
const VENDOR_EVIDENCE = {
  v1: { eyebrow: 'Source · IKTVA quarterly report Q1 2026 · NPCC qualification file',
        title: 'ZahidEng JV — IKTVA 72% (verified)',
        issuedBy: 'IKTVA Secretariat · CSP-IKTVA-2024-Rev3',
        sections: [
          { h: 'IKTVA score', p: '72% (verified Q1 2026). Saudization 18% · Localised spend $1.42B · R&D 1.1%.' },
          { h: 'OOK exposure', p: '0% — fully IK-incorporated JV. No OOK content reported in last 4 quarters.' },
          { h: 'Performance', p: '4 prior PAs · avg performance 4.7/5 · zero schedule slips >7 days.' },
        ] },
  v2: { eyebrow: 'Source · IKTVA Q1 2026 · Al-Yamamah qualification file',
        title: 'Al-Yamamah Steel — IKTVA 68% (verified)',
        sections: [{ h: 'Summary', p: 'IKTVA 68% · OOK 0% · 6 prior PAs · perf 4.4/5.' }] },
  v3: { eyebrow: 'Source · IKTVA Q1 2026 · NPCC KSA file',
        title: 'NPCC KSA — IKTVA 81% (best in pool)',
        sections: [{ h: 'Summary', p: 'IKTVA 81% · OOK 0% · 3 prior PAs · perf 4.5/5. Highest IKTVA in qualified pool.' }] },
  v4: { eyebrow: 'Source · ownership matrix · IKTVA registry',
        title: 'Saipem Taqa — OOK 56% flagged',
        sections: [
          { h: 'OOK content', p: 'Beneficial ownership matrix shows 56% Saipem Italy parent equity. Triggers OOK >50% review under §5.4.13.' },
          { h: 'IKTVA', p: '64% — below 65% IK MP-LSTK floor. Procura recommends Hold until ownership restructure or IKTVA uplift commitment.' },
        ],
        quote: '"Saipem Taqa retains 56% Italian-parent equity per 2025 disclosure. OOK declaration matches." — IKTVA Secretariat' },
  v5: { eyebrow: 'Source · IKTVA Q1 2026',
        title: 'Sinopec MEC — IKTVA 58% (below floor)',
        sections: [{ h: 'Concern', p: 'IKTVA 58% is below MP-LSTK 65% floor. Procura recommends Hold unless geographic-coverage rationale exists.' }] },
  v6: { eyebrow: 'Source · IKTVA Q1 2026',
        title: 'JGC Gulf — IKTVA 65% (at floor)',
        sections: [{ h: 'Summary', p: 'IKTVA 65% · OOK 0% · 2 prior PAs · perf 4.3/5. Meets minimum.' }] },
  v7: { eyebrow: 'Source · IKTVA Q1 2026',
        title: 'Petrofac IK — Held (capacity constraint)',
        sections: [{ h: 'Why held', p: 'Currently engaged on PA-LFPA-0212 (Khurais Off-Plot Phase 2) — limited bid-team capacity through July. Procura recommends holding for next slate.' }] },
  v8: { eyebrow: 'Source · IKTVA Q1 2026',
        title: 'Worley Arabia — Held (geographic mismatch)',
        sections: [{ h: 'Why held', p: 'Khurais site is >250km from Worley Dammam yard. Mob cost forecast exceeds CE band by ~6%.' }] },
};

const PACKAGE_EVIDENCE = {
  p1: { eyebrow: 'Source · PA template MP-IK-LSTK', title: 'PA template MP-IK-LSTK',
        sections: [{ h: 'What this is', p: 'Master Pricing — In-Kingdom — Lumpsum Turnkey Contract. Inherited from PA-LFPA-0218 contract track.' }] },
  p2: { eyebrow: 'Source · PR Scope of Work', title: 'Schedule B · Scope of Work',
        sections: [{ h: 'Source', p: 'Auto-assembled from PR section 3.1–3.6 (Khurais Off-Plot tie-in scope).' }] },
  p3: { eyebrow: 'Source · template pricing format', title: 'Schedule C · Pricing format',
        sections: [{ h: 'Source', p: 'MP-IK-LSTK default pricing breakdown (lumpsum + provisional + day-rate).' }] },
  p4: { eyebrow: 'Source · IKTVA Schedule S/SM template', title: 'Schedule S/H · Saudization & Safety',
        sections: [{ h: 'Source', p: 'Saudization floor 12% (MP-LSTK ≥$50M default). HSE plan template attached.' }] },
  p5: { eyebrow: 'Source · MP terms template', title: 'Schedule G · Major Project terms',
        sections: [{ h: 'Source', p: 'Standard MP terms package — schedules H, J, K bundled.' }] },
  p6: { eyebrow: 'Source · IKTVA reporting pack template', title: 'IKTVA Reporting Pack',
        sections: [{ h: 'What\'s pending', p: 'Quarterly IKTVA reporting calendar and submission templates. Procura will pre-fill after award.' }] },
  p7: { eyebrow: 'Source · pre-bid Q&A standard window', title: 'Pre-bid Q&A window (7 days)',
        sections: [{ h: 'Status', p: '7-day Q&A window starts on RFP issue. CR moderates and publishes consolidated answers to all bidders.' }] },
};

export default function BidSlate() {
  const navigate = useNavigate();

  const [pool, setPool] = useState(BS_POOL);
  const [pkg, setPkg] = useState(BS_PACKAGE);
  const [flaggedV, setFlaggedV] = useState({});    // {vendorId: 'reason'}
  const [openFlagV, setOpenFlagV] = useState(null);
  const [flagNoteV, setFlagNoteV] = useState('');
  const [openHelp, setOpenHelp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [evid, setEvid] = useState(null);
  const [activeStep, setActiveStep] = useState(null); // user-overridden wizard step

  const showToast = makeToaster(setToast);

  const slated = useMemo(() => pool.filter((v) => v.slated).length, [pool]);
  const ready = useMemo(() => pkg.filter((p) => p.done).length, [pkg]);
  const minBidders = 3;
  const canIssue = slated >= minBidders && ready === pkg.length && Object.keys(flaggedV).length === 0;

  /* Sub-stepper config */
  const BS_STEPS = [
    { id: 'pool',    num: 1, label: 'Vendor pool' },
    { id: 'package', num: 2, label: 'RFP package' },
    { id: 'issue',   num: 3, label: 'Issue & forecast' },
  ];
  const derivedStep = slated < minBidders ? 'pool' : ready < pkg.length ? 'package' : 'issue';
  const currentStep = activeStep || derivedStep;
  const stepIdx = BS_STEPS.findIndex((s) => s.id === currentStep);

  const toggleSlate = (id) => {
    const v = pool.find((x) => x.id === id);
    setPool((p) => p.map((x) => x.id === id ? { ...x, slated: !x.slated } : x));
    showToast(`${v.name} ${v.slated ? 'held back' : 'added to slate'}.`);
  };
  const togglePkg = (id) => {
    setPkg((p) => p.map((x) => x.id === id ? { ...x, done: !x.done } : x));
  };

  const startFlag = (id) => { setOpenFlagV(id); setFlagNoteV(''); };
  const saveFlag = (id) => {
    const note = flagNoteV.trim() || 'CR flagged this vendor for review before slate.';
    setFlaggedV((p) => ({ ...p, [id]: note }));
    setPool((p) => p.map((x) => x.id === id ? { ...x, slated: false } : x));
    setOpenFlagV(null);
    showToast('Vendor flagged. Held from slate until reviewed.', 'warn');
  };
  const clearFlag = (id) => {
    setFlaggedV((p) => { const n = { ...p }; delete n[id]; return n; });
    showToast('Flag cleared.');
  };

  const issueRfp = () => {
    if (!canIssue) return;
    setConfirm({
      title: `Issue RFP to ${slated} bidders?`,
      body: `RFP package will be transmitted to all ${slated} slated vendors. Bid window opens immediately (${BS_HEADER.windowDays} days + 7-day Q&A). Bidders will be notified by email and via the supplier portal.`,
      confirmLabel: 'Yes, issue RFP',
      onYes: () => {
        setPaStatus('PR-2026-04481', { status: PA_STATUS.BIDDING });
        setConfirm(null);
        showToast(`RFP issued to ${slated} bidders. Bid window now open.`);
        setTimeout(() => navigate('/bid-evaluation'), 600);
      },
    });
  };

  return (
    <div className="page">
      <div className="wrap">

        <PaHero
          pa={BS_HEADER.pa}
          title={BS_HEADER.title}
          value={BS_PA_META.value}
          track={BS_PA_META.track}
          proponent={BS_PA_META.proponent}
          dept={BS_PA_META.dept}
          notes={`${BS_HEADER.due} · window ${BS_HEADER.windowDays}d + 7d Q&A`}
          currentStage={4}
          totalStages={7}
          stageLabel={STATUS_LABELS[PA_STATUS.BID_SLATE]}
          slaLeft={<><b>2d</b> left <span className="dim">· to issue</span></>}
          onViewPa={() => setEvid(BS_PA_DOC)}
          onViewPrs={() => setEvid(BS_PRS_DOC)}
        />

        {/* ── SUB-STEPPER (Pool → Package → Issue) ─────────────── */}
        <div className="wiz-stepper" role="tablist">
          {BS_STEPS.map((s, i) => {
            const dIdx = BS_STEPS.findIndex((x) => x.id === derivedStep);
            const state = s.id === currentStep ? 'active' : i < dIdx ? 'done' : 'next';
            return (
              <button key={s.id} className={`wiz-step is-${state}`} onClick={() => setActiveStep(s.id)}>
                <span className="wiz-num">{state === 'done' ? '✓' : s.num}</span>
                <span className="wiz-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── STEP 1 · VENDOR POOL ─────────────────────────────── */}
        {currentStep === 'pool' && (
        <div className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="ic">{ICO.users}</div>
              <h3>Vendor pool · IKTVA-qualified</h3>
              <AiChip verb="pre-qualified" ago="3s" />
              <InfoIcon openKey="pool" currentOpen={openHelp} onToggle={setOpenHelp}>
                Procura pulls the qualified pool from the IKTVA registry filtered by contract track (MP-IK-LSTK) and scope keywords. Each row shows the latest IKTVA score, OOK content, prior-PA count, and 0-5 performance rating. Override the auto-slate per vendor; <b>Flag</b> any vendor whose qualification is stale or contested.
              </InfoIcon>
            </div>
            <span className="count">{slated} slated · {pool.length - slated} held{Object.keys(flaggedV).length ? ` · ${Object.keys(flaggedV).length} flagged` : ''}</span>
          </div>
          <div className="panel-body tight" style={{ overflowX: 'auto' }}>
            <table className="vendor-tbl">
              <thead>
                <tr>
                  <th>Slate</th>
                  <th>Vendor</th>
                  <th>IKTVA</th>
                  <th>OOK</th>
                  <th>Prior PAs</th>
                  <th>Perf</th>
                  <th>Flag</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pool.map((v) => {
                  const isFlagged = !!flaggedV[v.id];
                  const isFlagging = openFlagV === v.id;
                  return (
                    <Fragment key={v.id}>
                      <tr className={isFlagged ? 'is-flagged' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={v.slated}
                            disabled={isFlagged}
                            onChange={() => toggleSlate(v.id)}
                            title={isFlagged ? 'Cannot slate — vendor is flagged' : ''}
                          />
                        </td>
                        <td className="name">{v.name}</td>
                        <td className="num">
                          <span className={`pill ${v.iktva >= 65 ? 'ok' : 'warn'}`}>{v.iktva}%</span>
                        </td>
                        <td className="num">
                          {v.ook > 0 ? <span className="pill warn">{v.ook}%</span> : <span className="pill ok">0%</span>}
                        </td>
                        <td className="num">{v.prior}</td>
                        <td className="num">{v.perf.toFixed(1)}</td>
                        <td>{v.flag && <span className="pill warn">{v.flag}</span>}</td>
                        <td className="actions">
                          <button className="link-btn" onClick={() => setEvid(VENDOR_EVIDENCE[v.id])}>View source</button>
                          {isFlagged ? (
                            <button className="pbtn tiny ghost" onClick={() => clearFlag(v.id)}>Clear flag</button>
                          ) : (
                            <button className="rd-flag" onClick={() => startFlag(v.id)}>Flag</button>
                          )}
                        </td>
                      </tr>
                      {isFlagging && (
                        <tr className="flag-note-row">
                          <td colSpan={8}>
                            <div className="rd-flag-form">
                              <input
                                autoFocus
                                placeholder={`Reason ${v.name} should not be on the slate…`}
                                value={flagNoteV}
                                onChange={(e) => setFlagNoteV(e.target.value)}
                              />
                              <button className="pbtn tiny" onClick={() => setOpenFlagV(null)}>Cancel</button>
                              <button className="pbtn tiny warn" onClick={() => saveFlag(v.id)}>Flag &amp; hold</button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {isFlagged && !isFlagging && (
                        <tr className="flag-note-row">
                          <td colSpan={8}><b>Flagged:</b> {flaggedV[v.id]}</td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ── STEP 2 · RFP PACKAGE ─────────────────────────────── */}
        {currentStep === 'package' && (
        <div className="panel">
            <div className="panel-head">
              <div className="ph-l">
                <div className="ic">{ICO.paper}</div>
                <h3>RFP package</h3>
                <AiChip verb="assembled" ago="just now" />
                <InfoIcon openKey="pkg" currentOpen={openHelp} onToggle={setOpenHelp}>
                  RFP package items are auto-assembled from the PA template and PR scope. Click any row to toggle ready/not-ready. Tap <b>View source</b> on any item to see where Procura pulled it from before checking it off.
                </InfoIcon>
              </div>
              <span className="count">{ready}/{pkg.length}</span>
            </div>
            <div className="panel-body" style={{ padding: '8px 8px' }}>
              <div className="checklist">
                {pkg.map((p) => (
                  <div key={p.id} className={`check-row ${p.done ? 'done' : ''}`}>
                    <div className="cr-box" onClick={() => togglePkg(p.id)}>{ICO.check}</div>
                    <div className="cr-label" onClick={() => togglePkg(p.id)}>{p.label}</div>
                    <button
                      className="link-btn"
                      style={{ marginLeft: 'auto' }}
                      onClick={(e) => { e.stopPropagation(); setEvid(PACKAGE_EVIDENCE[p.id]); }}
                    >View source</button>
                  </div>
                ))}
              </div>
            </div>
        </div>
        )}

        {/* ── STEP 3 · ISSUE & FORECAST ────────────────────────── */}
        {currentStep === 'issue' && (
        <div className={'panel ' + (canIssue ? 'route-panel is-ready' : 'route-panel is-gated')}>
          <div className="panel-head">
            <div className="ph-l">
              <div className={'step-badge ' + (canIssue ? 'tone-green' : 'tone-amber')} aria-hidden="true">
                <span className="sb-ic">{canIssue ? ICO.checkBold : ICO.send}</span>
              </div>
              <h3>Issue RFP</h3>
              <AiChip verb={canIssue ? 'cleared' : 'gating'} ago="just now" />
              <InfoIcon openKey="issue" currentOpen={openHelp} onToggle={setOpenHelp}>
                Issuing the RFP locks the slate, dispatches the package to all slated vendors via the supplier portal + email, and opens the bid window (14 days RFP + 7 days Q&amp;A). Cannot be undone — addendums issue separately.
              </InfoIcon>
            </div>
            <span className={'chip-pill ' + (canIssue ? 'is-ok' : 'is-warn')}>{canIssue ? 'Ready' : 'Gated'}</span>
          </div>
          <div className="panel-body" style={{ padding: 18 }}>
            <div className={'gate-banner ' + (canIssue ? 'is-ready' : 'is-gated')}>
              <div className="gb-ic">{canIssue ? ICO.checkBold : ICO.shield}</div>
              <div className="gb-body">
                <div className="gb-title">{canIssue ? 'Ready to issue RFP' : 'Gated — complete slate + package first'}</div>
                <div className="gb-sub">{canIssue
                  ? `${slated} bidders will receive the RFP. Bid window opens immediately for ${BS_HEADER.windowDays} days + 7-day Q&A.`
                  : 'Resolve the items below, then return here to issue.'}</div>
              </div>
            </div>
            <ul className="gate-list">
              <li className={slated >= minBidders ? 'is-ok' : ''}>
                <span className="gl-ic">{slated >= minBidders ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">At least {minBidders} vendors slated</span>
                <span className={'chip-pill xs ' + (slated >= minBidders ? 'is-ok' : 'is-warn')}>{slated} slated</span>
              </li>
              <li className={ready === pkg.length ? 'is-ok' : ''}>
                <span className="gl-ic">{ready === pkg.length ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">All package items ready</span>
                <span className={'chip-pill xs ' + (ready === pkg.length ? 'is-ok' : 'is-warn')}>{ready}/{pkg.length}</span>
              </li>
              <li className={Object.keys(flaggedV).length === 0 ? 'is-ok' : ''}>
                <span className="gl-ic">{Object.keys(flaggedV).length === 0 ? ICO.checkBold : <span className="gl-dot" />}</span>
                <span className="gl-label">No flagged vendors</span>
                <span className={'chip-pill xs ' + (Object.keys(flaggedV).length === 0 ? 'is-ok' : 'is-warn')}>{Object.keys(flaggedV).length} flagged</span>
              </li>
            </ul>

            {/* Procura forecast tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
              <div className="chip-card b">
                <div className="label">Expected responses</div>
                <div className="value">{Math.max(0, slated - 1)} of {slated}</div>
              </div>
              <div className="chip-card t">
                <div className="label">Avg quote band</div>
                <div className="value">$58M – $69M</div>
              </div>
              <div className="chip-card g">
                <div className="label">Best IKTVA in pool</div>
                <div className="value">81% (NPCC KSA)</div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ── PERSISTENT FOOTER (step-aware) ────────────────── */}
        <div className="step-foot">
          <div className="step-foot-l">
            <button
              className="pbtn ghost"
              onClick={() => stepIdx === 0 ? navigate('/functional-review') : setActiveStep(BS_STEPS[stepIdx - 1].id)}
            >
              {ICO.arrowL}<span>{stepIdx === 0 ? 'Back to Functional Review' : 'Back'}</span>
            </button>
          </div>
          <div className="step-foot-r">
            <button className="pbtn" onClick={() => showToast('RFP preview generated.')}><span>{ICO.download}</span>Preview RFP</button>
            {stepIdx < BS_STEPS.length - 1 ? (
              <button
                className="pbtn-premium"
                onClick={() => setActiveStep(BS_STEPS[stepIdx + 1].id)}
              >
                <span className="pbtn-premium-label">Continue</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            ) : (
              <button
                className="pbtn-premium"
                disabled={!canIssue}
                onClick={issueRfp}
                title={canIssue ? 'All checks pass — issue RFP' : `Need ≥${minBidders} slated, all package items ready, no open flags`}
              >
                <span className="pbtn-premium-label">Issue RFP to {slated} bidders</span>
                <span className="pbtn-premium-arrow">{ICO.send}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <EvidenceModal doc={evid} onClose={() => setEvid(null)} />
      <Toast toast={toast} />
    </div>
  );
}
