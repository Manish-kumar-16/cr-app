import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { AS_HEADER, AS_PACKAGE, AS_ROUTE } from '../data/constants';
import { AiChip, InfoIcon, ConfirmModal, Toast, EvidenceModal, PaHero, makeToaster } from '../components/WizardKit';
import { PA_STATUS, setPaStatus } from '../lib/paStatus';

const AS_PA_META = {
  track: 'LFPA · MP-IK-LSTK · SRC route',
  proponent: 'Ahmed Al-Mahmoud',
  dept: 'D&CE',
};
const AS_PA_DOC = {
  eyebrow: 'Document · award memo · draft v1',
  title: 'PA-LFPA-0218 — Award recommendation',
  sections: [{ h: 'Recommended awardee', p: 'ZahidEng JV · $62.4M · composite 92 · IKTVA 84%. Bid +3.7% vs CE — within band, no +5% memo required.' }],
};
const AS_PRS_DOC = {
  eyebrow: 'Source · PR Strategy doc · PRS-2026-0218',
  title: 'PR Strategy — PR-2026-04481',
  sections: [{ h: 'Award path', p: 'PA value >$50M triggers SRC route. Award memo → BOC → CD Manager → SRC Secretary → SRC. Standard 2-business-day approval window.' }],
};

const PKG_EVIDENCE = {
  p1: { eyebrow: 'Source · Bid Evaluation composite ranking', title: 'Composite ranking — signed',
        sections: [{ h: 'What this is', p: 'The signed composite ranking sheet from Bid Evaluation. Inherited automatically into the award packet.' }] },
  p2: { eyebrow: 'Source · BRT verdict', title: 'BRT technical pass attached',
        sections: [{ h: 'Status', p: 'BRT signed off all 47 spec items. PDF attached to packet.' }] },
  p3: { eyebrow: 'Source · IRT IKTVA review', title: 'IRT IKTVA review attached',
        sections: [{ h: 'Status', p: 'IRT verified IKTVA score 84% for ZahidEng JV. Signed review attached.' }] },
  p4: { eyebrow: 'Source · §5.4.10 CE +5% memo', title: 'CE +5% memo — N/A',
        sections: [{ h: 'Status', p: 'Not required (bid is +3.7% vs CE). Marked as N/A in packet.' }] },
  p5: { eyebrow: 'Source · §5.4.13 ownership matrix', title: 'OOK overlap resolution memo',
        sections: [{ h: 'Status', p: 'B2/B4 ownership overlap was resolved before composite (B4 disqualified). Memo attached.' }] },
  p6: { eyebrow: 'Source · NoA template', title: 'Draft Notification of Award',
        sections: [{ h: 'What\'s pending', p: 'Procura has the NoA template pre-filled with the winner identity, value, and start date. Tap Generate to produce the PDF for CD Manager signature.' }] },
  p7: { eyebrow: 'Source · unsuccessful-bidder letter template', title: 'Unsuccessful-bidder letters',
        sections: [{ h: 'What\'s pending', p: '5 unsuccessful-bidder letters need to be drafted (one per non-winning bidder). Procura will pre-fill names, scores, and reason codes.' }] },
};

const ROUTE_EVIDENCE = {
  r1: { eyebrow: 'Source · BOC log · today 14:30', title: 'BOC chair · Reviewed composite',
        sections: [{ h: 'Verdict', p: 'BOC chair reviewed the composite ranking and signed off at 14:30. No comments.' }] },
  r2: { eyebrow: 'Source · CD Manager endorsement', title: 'CD Manager · Endorsed award memo',
        sections: [{ h: 'Verdict', p: 'CD Manager endorsed at 16:00. Award memo signed.' }] },
  r3: { eyebrow: 'Source · SRC Secretary queue', title: 'SRC Secretary · Compiling SRC packet',
        sections: [{ h: 'Status', p: 'SRC Secretary will compile the SRC packet tomorrow at 09:00. Packet must include items p6 and p7 — currently pending CR action.' }] },
  r4: { eyebrow: 'Source · SRC scheduling', title: 'SRC · Approve award',
        sections: [{ h: 'Expected', p: 'SRC convenes within 2 business days of packet receipt. Standard approval window unless committee requests clarification.' }] },
  r5: { eyebrow: 'Source · post-approval workflow', title: 'You · Issue NoA · notify losers',
        sections: [{ h: 'What you do', p: 'On SRC approval, issue the NoA to ZahidEng JV and the 5 unsuccessful-bidder letters in one batch from this screen.' }] },
};

function PacketRow({ item, onToggle, onView, onGenerate }) {
  return (
    <div className={`pkt-row ${item.done ? 'is-done' : 'is-pending'}`}>
      <button className="pkt-check" onClick={() => onToggle(item.id)} aria-label={item.done ? 'Mark not done' : 'Mark done'}>
        {item.done ? <span className="pkt-tick">{ICO.checkBold}</span> : <span className="pkt-dot" />}
      </button>
      <div className="pkt-body">
        <div className="pkt-label">{item.label}</div>
        <div className="pkt-source">
          {item.kind === 'inherited' ? <span className="pkt-pill is-inherited">Inherited</span> : <span className="pkt-pill is-action">Your action</span>}
          <span className="pkt-source-text">· {item.source}</span>
          {item.est && !item.done && <span className="pkt-eta">· ~{item.est}</span>}
        </div>
      </div>
      <div className="pkt-actions">
        <button className="row-link-btn" onClick={() => onView(item.id)}>View source</button>
        {!item.done && (
          <button className="pbtn-mini-primary" onClick={() => onGenerate(item.id, item.label)}>
            <span className="pbtn-mini-ic">{ICO.wand}</span>Generate
          </button>
        )}
      </div>
    </div>
  );
}

function TimelineNode({ r, isNudged, onView, onNudge }) {
  const state = r.state;
  return (
    <div className={`tl-node tl-${state}`}>
      <div className="tl-rail">
        <div className="tl-avatar">
          {state === 'done' ? <span className="tl-avatar-tick">{ICO.checkBold}</span> : <span className="tl-avatar-initials">{r.initials}</span>}
          {state === 'now' && <span className="tl-pulse" aria-hidden="true" />}
        </div>
        <div className="tl-line" aria-hidden="true" />
      </div>
      <div className="tl-card">
        <div className="tl-card-head">
          <div className="tl-who">
            <span className="tl-who-name">{r.who}</span>
            <span className="tl-who-role">{r.role}</span>
          </div>
          <span className={`tl-state-chip tl-state-${state}`}>
            {state === 'done' && <><span className="tl-state-dot" /> Complete</>}
            {state === 'now'  && <><span className="tl-state-dot is-pulse" /> In progress</>}
            {state === 'next' && <>Upcoming</>}
          </span>
        </div>
        <div className="tl-step">{r.step}</div>
        <div className="tl-meta">
          <span className="tl-when">{ICO.clock}<span>{r.when}</span></span>
          <span className="tl-sla">SLA · {r.sla}</span>
          {isNudged && <span className="tl-nudged">· Nudged</span>}
        </div>
        <div className="tl-actions">
          <button className="row-link-btn" onClick={() => onView(r.id)}>View source</button>
          {state !== 'done' && r.who !== 'You' && (
            <button className="pbtn-mini" disabled={isNudged} onClick={() => onNudge(r.id, r.who)}>
              {isNudged ? 'Nudged' : 'Nudge'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AwardSign() {
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(AS_PACKAGE);
  const [nudged, setNudged] = useState({});
  const [openHelp, setOpenHelp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [evid, setEvid] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [readyOpen, setReadyOpen] = useState(true);

  const showToast = makeToaster(setToast);

  const completed = useMemo(() => pkg.filter((p) => p.done).length, [pkg]);
  const allDone = completed === pkg.length;
  const pending = pkg.filter((p) => !p.done);
  const ready   = pkg.filter((p) => p.done);

  const routeDone = AS_ROUTE.filter((r) => r.state === 'done').length;
  const routeNext = AS_ROUTE.find((r) => r.state === 'now');

  /* Sub-stepper */
  const AS_STEPS = [
    { id: 'winner', num: 1, label: 'Winner',        ico: ICO.medal, tone: 'green' },
    { id: 'packet', num: 2, label: 'Award packet',  ico: ICO.paper, tone: 'blue'  },
    { id: 'route',  num: 3, label: 'SRC route',     ico: ICO.flow,  tone: 'teal'  },
  ];
  const derivedStep = !allDone ? 'packet' : 'route';
  const currentStep = activeStep || derivedStep;
  const stepIdx = AS_STEPS.findIndex((s) => s.id === currentStep);

  const toggle = (id) => setPkg((p) => p.map((x) => x.id === id ? { ...x, done: !x.done } : x));

  const generate = (id, label) => setConfirm({
    title: `Generate "${label}"?`,
    body: 'Procura will pre-fill the template with this PA\'s details, then mark this item ready. You can edit and re-sign before adding to the SRC packet.',
    confirmLabel: 'Generate',
    onYes: () => {
      setPkg((p) => p.map((x) => x.id === id ? { ...x, done: true } : x));
      setConfirm(null);
      showToast(`${label} generated.`);
    },
  });

  const nudgeRoute = (id, who) => setConfirm({
    tone: 'warn',
    title: `Nudge ${who}?`,
    body: 'A reminder will be sent. SRC route nudges are visible to the CD Manager.',
    confirmLabel: 'Send nudge',
    onYes: () => { setNudged((p) => ({ ...p, [id]: true })); setConfirm(null); showToast(`Reminder sent to ${who}.`); },
  });

  const sendToSrc = () => {
    if (!allDone) return;
    setConfirm({
      tone: 'warn',
      title: 'Send packet to SRC and open cockpit?',
      body: 'This locks the award packet and queues it for the SRC Secretary. You cannot revise packet items after sending. The contract cockpit opens for ongoing monitoring.',
      confirmLabel: 'Yes, send to SRC',
      onYes: () => {
        setPaStatus('PR-2026-04481', { status: PA_STATUS.EXECUTED });
        setConfirm(null);
        showToast('Packet sent to SRC.');
        setTimeout(() => navigate('/contract/' + AS_HEADER.pa), 600);
      },
    });
  };

  return (
    <div className="page">
      <div className="wrap">

        <PaHero
          pa={AS_HEADER.pa}
          title={AS_HEADER.title}
          value={AS_HEADER.value}
          track={AS_PA_META.track}
          proponent={AS_PA_META.proponent}
          dept={AS_PA_META.dept}
          notes={`Winner: ${AS_HEADER.winner} · ${AS_HEADER.saving}`}
          currentStage={7}
          totalStages={7}
          stageLabel="Award & Sign"
          slaLeft={<><b>1d</b> left <span className="dim">· SRC packet SLA</span></>}
          onViewPa={() => setEvid(AS_PA_DOC)}
          onViewPrs={() => setEvid(AS_PRS_DOC)}
        />

        {/* ── SUB-STEPPER ──────────────────────────────────────── */}
        <div className="wiz-stepper" role="tablist">
          {AS_STEPS.map((s, i) => {
            const dIdx = AS_STEPS.findIndex((x) => x.id === derivedStep);
            const state = s.id === currentStep ? 'active' : i < dIdx ? 'done' : 'next';
            return (
              <button key={s.id} className={`wiz-step is-${state}`} onClick={() => setActiveStep(s.id)}>
                <span className="wiz-num">{state === 'done' ? '✓' : s.num}</span>
                <span className="wiz-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
           STEP 1 · WINNER — premium award-hero
           ══════════════════════════════════════════════════════════ */}
        {currentStep === 'winner' && (
          <>
            <div className="award-hero">
              <div className="ah-medal">
                <div className="ah-medal-disc">{ICO.medal}</div>
                <div className="ah-medal-ribbon-l" aria-hidden="true" />
                <div className="ah-medal-ribbon-r" aria-hidden="true" />
                <div className="ah-medal-label">Awardee</div>
              </div>
              <div className="ah-body">
                <div className="ah-id">
                  <span className="bid-id">{AS_HEADER.bidderId}</span>
                  <h2>{AS_HEADER.winner}</h2>
                  <AiChip verb="recommended" ago="just now" />
                </div>
                <div className="ah-rationale">
                  <b>Why this awardee:</b> highest composite ({AS_HEADER.composite}/100) across {pkg.length}-bidder field — best tech ({AS_HEADER.tech}/100), IKTVA {AS_HEADER.iktva}% (above floor), bid {AS_HEADER.value} ({AS_HEADER.dev} vs CE — within band, no +5% memo). Confirmed by BRT + IRT + commercial envelope.
                </div>
                <div className="ah-stats">
                  <div className="ah-stat">
                    <div className="ah-stat-label">Contract value</div>
                    <div className="ah-stat-value">{AS_HEADER.value}</div>
                    <div className="ah-stat-sub ok">{AS_HEADER.saving}</div>
                  </div>
                  <div className="ah-stat">
                    <div className="ah-stat-label">Composite</div>
                    <div className="ah-stat-value">{AS_HEADER.composite}<span className="dim">/100</span></div>
                    <div className="ah-stat-sub">Tech {AS_HEADER.tech} · IKTVA {AS_HEADER.iktva}%</div>
                  </div>
                  <div className="ah-stat">
                    <div className="ah-stat-label">Start · duration</div>
                    <div className="ah-stat-value">{AS_HEADER.durationMonths}<span className="dim"> mo</span></div>
                    <div className="ah-stat-sub">Mobilise {AS_HEADER.start}</div>
                  </div>
                </div>
                <div className="ah-cta">
                  <button className="pbtn" onClick={() => setEvid(BIDDER_EVIDENCE_LEAD)}>{ICO.doc}<span>View evidence</span></button>
                  <button className="pbtn" onClick={() => navigate('/bid-evaluation')}>{ICO.stats}<span>View ranking</span></button>
                  <InfoIcon openKey="winner" currentOpen={openHelp} onToggle={setOpenHelp}>
                    Procura recommends the highest composite scorer that is not disqualified, weighted 50% Tech · 25% IKTVA · 25% Commercial. CR can override by shortlisting an alternate in Bid Evaluation.
                  </InfoIcon>
                </div>
              </div>
            </div>

            <div className="cr-action-card">
              <div className="cra-ic">{ICO.sparkle}</div>
              <div className="cra-body">
                <div className="cra-title">Your action on this step</div>
                <div className="cra-text">Confirm the recommended awardee, then continue to the packet. You can still override in Bid Evaluation if needed — once the packet is sent to SRC, it locks.</div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════
           STEP 2 · AWARD PACKET — attention-priority grouped checklist
           ══════════════════════════════════════════════════════════ */}
        {currentStep === 'packet' && (
          <div className="panel">
            <div className="panel-head">
              <div className="ph-l">
                <div className="step-badge tone-blue" aria-hidden="true">
                  <span className="sb-ic">{ICO.paper}</span>
                </div>
                <h3>Award packet</h3>
                <AiChip verb="checked" ago="3s" />
                <InfoIcon openKey="pkg" currentOpen={openHelp} onToggle={setOpenHelp}>
                  Each item is required for the SRC packet. Items inherited from earlier stages are pre-attached. Pending items (NoA + unsuccessful-bidder letters) need CR to Generate before sending. Tap View source on any item to inspect its origin.
                </InfoIcon>
              </div>
              <span className={`chip-pill ${allDone ? 'is-ok' : 'is-warn'}`}>{completed}/{pkg.length} ready</span>
            </div>

            {/* Compact progress meter */}
            <div className="pkt-meter-wrap">
              <div className="pkt-meter"><i style={{ width: `${(completed/pkg.length)*100}%` }} /></div>
              <div className="pkt-meter-text">
                {allDone
                  ? <><span className="ok">All packet items ready.</span> You can send to SRC from the footer.</>
                  : <><b>{pending.length}</b> item{pending.length>1?'s':''} need your action before the packet can ship to SRC.</>}
              </div>
            </div>

            <div className="panel-body" style={{ padding: '4px 16px 18px' }}>
              {/* Group 1 — Needs your attention */}
              {pending.length > 0 && (
                <>
                  <div className="pkt-group-h tone-warn">
                    <span className="pkt-group-title">Needs your attention</span>
                    <span className="chip-pill xs is-warn">{pending.length}</span>
                  </div>
                  <div className="pkt-stack">
                    {pending.map((p) => (
                      <PacketRow key={p.id} item={p} onToggle={toggle} onView={(id) => setEvid(PKG_EVIDENCE[id])} onGenerate={generate} />
                    ))}
                  </div>
                </>
              )}

              {/* Group 2 — Ready (collapsed) */}
              {ready.length > 0 && (
                <details className="pkt-ready-block" open={readyOpen} onToggle={(e) => setReadyOpen(e.currentTarget.open)}>
                  <summary className="pkt-group-h tone-ok">
                    <span className="pkt-chev" aria-hidden="true">{ICO.chevR}</span>
                    <span className="pkt-group-title">Ready · inherited</span>
                    <span className="chip-pill xs is-ok">{ready.length}</span>
                  </summary>
                  <div className="pkt-stack" style={{ marginTop: 8 }}>
                    {ready.map((p) => (
                      <PacketRow key={p.id} item={p} onToggle={toggle} onView={(id) => setEvid(PKG_EVIDENCE[id])} onGenerate={generate} />
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
           STEP 3 · SRC ROUTE — vertical avatar timeline
           ══════════════════════════════════════════════════════════ */}
        {currentStep === 'route' && (
          <>
            <div className="panel">
              <div className="panel-head">
                <div className="ph-l">
                  <div className={'step-badge ' + (allDone ? 'tone-green' : 'tone-teal')} aria-hidden="true">
                    <span className="sb-ic">{allDone ? ICO.checkBold : ICO.flow}</span>
                  </div>
                  <h3>SRC route</h3>
                  <AiChip verb="polled" ago="60s" />
                  <InfoIcon openKey="route" currentOpen={openHelp} onToggle={setOpenHelp}>
                    Procura polls the SRC routing queue every 60s. Each step shows the responsible party, their action, and expected timing. Use Nudge to send a reminder if a step is at risk of missing its window.
                  </InfoIcon>
                </div>
                <span className="chip-pill is-ok">{routeDone}/{AS_ROUTE.length} complete</span>
              </div>

              {/* Aggregate route summary */}
              <div className="route-summary">
                <div className="rs-block">
                  <div className="rs-label">Currently</div>
                  <div className="rs-value">{routeNext ? routeNext.who : '—'}</div>
                  <div className="rs-sub">{routeNext ? routeNext.step : 'All complete'}</div>
                </div>
                <div className="rs-sep" aria-hidden="true" />
                <div className="rs-block">
                  <div className="rs-label">Expected approval</div>
                  <div className="rs-value">Tue, 21 Jul</div>
                  <div className="rs-sub">+2 business days · standard SRC window</div>
                </div>
                <div className="rs-sep" aria-hidden="true" />
                <div className="rs-block">
                  <div className="rs-label">Packet readiness</div>
                  <div className={'rs-value ' + (allDone ? 'ok' : 'warn')}>{completed}/{pkg.length}</div>
                  <div className="rs-sub">{allDone ? 'Ready to ship' : `${pending.length} pending in Step 2`}</div>
                </div>
              </div>

              <div className="panel-body" style={{ padding: '14px 18px 22px' }}>
                <div className="tl-stack">
                  {AS_ROUTE.map((r) => (
                    <TimelineNode key={r.id} r={r} isNudged={!!nudged[r.id]} onView={(id) => setEvid(ROUTE_EVIDENCE[id])} onNudge={nudgeRoute} />
                  ))}
                </div>
              </div>
            </div>

            {/* Ready-to-ship celebration card when allDone */}
            {allDone && (
              <div className="ready-card">
                <div className="rc-medal">{ICO.medal}</div>
                <div className="rc-body">
                  <div className="rc-title">Packet ready for SRC</div>
                  <div className="rc-text">
                    {pkg.length} items signed · {AS_ROUTE.length} approvers queued · awarding <b>{AS_HEADER.winner}</b> at <b>{AS_HEADER.value}</b> ({AS_HEADER.saving}).
                    Send when ready — packet locks on send.
                  </div>
                </div>
                <button className="pbtn-premium" onClick={sendToSrc}>
                  <span className="pbtn-premium-label">Send to SRC</span>
                  <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── PERSISTENT FOOTER (step-aware) ────────────────── */}
        <div className="step-foot">
          <div className="step-foot-l">
            <button
              className="pbtn ghost"
              onClick={() => stepIdx === 0 ? navigate('/bid-evaluation') : setActiveStep(AS_STEPS[stepIdx - 1].id)}
            >
              {ICO.arrowL}<span>{stepIdx === 0 ? 'Back to Bid Evaluation' : 'Back'}</span>
            </button>
          </div>
          <div className="step-foot-r">
            <button className="pbtn" onClick={() => showToast('Award packet exported.')}><span>{ICO.download}</span>Export packet</button>
            {stepIdx < AS_STEPS.length - 1 ? (
              <button className="pbtn-premium" onClick={() => setActiveStep(AS_STEPS[stepIdx + 1].id)}>
                <span className="pbtn-premium-label">Continue</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
              </button>
            ) : (
              <button
                className="pbtn-premium"
                disabled={!allDone}
                onClick={sendToSrc}
                title={allDone ? 'Send to SRC and open cockpit' : `${pending.length} packet item(s) still pending`}
              >
                <span className="pbtn-premium-label">{allDone ? 'Send to SRC & open cockpit' : `Send to SRC (${pending.length} pending)`}</span>
                <span className="pbtn-premium-arrow">{ICO.arrowR}</span>
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

const BIDDER_EVIDENCE_LEAD = {
  eyebrow: 'Source · composite ranking · BRT · IRT · commercial envelope',
  title: 'ZahidEng JV — composite 92 (lead)',
  sections: [
    { h: 'Tech (96)', p: 'BRT scored 96/100. All 47 spec items pass.' },
    { h: 'IKTVA (84%)', p: 'IRT verified IKTVA 84% — best technical bidder.' },
    { h: 'Commercial ($62.4M, +3.7% vs CE)', p: 'Within CE band. No +5% memo required.' },
    { h: 'Savings vs highest bid', p: '$5.6M vs JGC Gulf high bid of $68.0M.' },
  ],
};
