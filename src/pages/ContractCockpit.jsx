import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { CC_HEADER, CC_KPIS, CC_GATES, CC_DEVIATIONS } from '../data/constants';
import { AiChip, InfoIcon, CrAction, ConfirmModal, Toast, EvidenceModal, makeToaster } from '../components/WizardKit';

const DEV_EVIDENCE = {
  d1: { eyebrow: 'Source · Variation Order #3 · approved 2026-03-12',
        title: 'VO #3 — additional cathodic protection',
        sections: [
          { h: 'What', p: 'Add cathodic protection to 320m of buried pipework discovered during trenching. Vendor priced at $520K (within 2% of CR estimate).' },
          { h: 'Why approved', p: 'Scope was implicit in the SOW but not itemised. Cost is reasonable. CD Manager approved on 2026-03-12.' },
        ] },
  d2: { eyebrow: 'Source · schedule report · 2026-04-02',
        title: 'Schedule slip 14 days — long-lead valve',
        sections: [
          { h: 'What', p: 'Long-lead 24" gate valve from approved supplier delayed by 14 days due to factory shutdown.' },
          { h: 'Action', p: 'Vendor is rebaselining the schedule. Tracking for impact on commissioning gate.' },
        ] },
  d3: { eyebrow: 'Source · IKTVA Q1 self-cert · OVERDUE',
        title: 'IKTVA Q1 self-certification overdue',
        sections: [
          { h: 'Required', p: 'Vendor must submit Q1 2026 IKTVA self-certification within 30 days of quarter end. Currently 7 days overdue.' },
          { h: 'CR action', p: 'Send overdue notice; escalate to IKTVA Secretariat if not received in 7 days.' },
        ] },
};

const KPI_EVIDENCE = {
  0: { eyebrow: 'Source · SES tracker',
       title: 'SES Approvals — 18 of 24',
       sections: [{ h: 'What this means', p: '24 Service Entry Sheets submitted by vendor. 18 approved by site engineer. 4 awaiting CR action (review and approve in SES queue). 2 returned for rework.' }] },
  1: { eyebrow: 'Source · Variation Order register',
       title: 'Variation Orders — 3 active · $1.4M cumulative',
       sections: [{ h: 'Detail', p: 'VO #3 approved ($520K), VO #4 in CR review ($410K), VO #5 vendor draft ($470K). All within contract VO ceiling.' }] },
  2: { eyebrow: 'Source · IKTVA quarterly report',
       title: 'IKTVA Compliance — 67%',
       sections: [{ h: 'Status', p: 'Q1 2026 IKTVA verified at 67% — above 65% contract target. Vendor self-cert for Q2 is overdue (see deviations).' }] },
  3: { eyebrow: 'Source · Q2 vendor performance evaluation',
       title: 'Performance — 4.6 / 5',
       sections: [{ h: 'Detail', p: 'Q2 evaluation: schedule 4.7, quality 4.8, HSE 5.0, IKTVA 4.0, cost 4.5. Cost dragged by VO volume.' }] },
};

const STATE_LABELS = { approved: 'Approved', tracking: 'Tracking', open: 'Open', rejected: 'Rejected' };

export default function ContractCockpit() {
  const navigate = useNavigate();

  const [devs, setDevs] = useState(CC_DEVIATIONS);
  const [openHelp, setOpenHelp] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [evid, setEvid] = useState(null);

  const showToast = makeToaster(setToast);

  const openCount = useMemo(() => devs.filter((d) => d.state === 'open').length, [devs]);

  const setDevState = (id, state, msg) => {
    setDevs((p) => p.map((d) => d.id === id ? { ...d, state } : d));
    showToast(msg);
  };

  const approveDev = (d) => setConfirm({
    title: `Approve "${d.what}"?`,
    body: `Marks this deviation as approved. Cost ${d.amt} will flow to the VO register. Auditable.`,
    confirmLabel: 'Approve',
    onYes: () => { setConfirm(null); setDevState(d.id, 'approved', 'Deviation approved.'); },
  });
  const rejectDev = (d) => setConfirm({
    tone: 'warn',
    title: `Reject "${d.what}"?`,
    body: 'Vendor will be notified. Rejection is logged in the audit trail.',
    confirmLabel: 'Reject',
    onYes: () => { setConfirm(null); setDevState(d.id, 'rejected', 'Deviation rejected.', 'warn'); },
  });
  const investigate = (d) => setDevState(d.id, 'tracking', 'Moved to tracking. CR investigation logged.');

  const notify = () => setConfirm({
    tone: 'warn',
    title: 'Send status notification?',
    body: 'A status summary will be sent to vendor PM + CD Manager + SRC Secretariat. Sparingly used outside of monthly reports.',
    confirmLabel: 'Send notification',
    onYes: () => { setConfirm(null); showToast('Status notification sent.'); },
  });

  return (
    <div className="page">
      <div className="wrap">

        <div className="page-head">
          <div className="title-block">
            <div className="eyebrow"><span className="dot"></span>Contract Cockpit · {CC_HEADER.status}</div>
            <h1>{CC_HEADER.title}</h1>
            <div className="head-meta">
              <b>{CC_HEADER.pa}</b><span className="sep">·</span>
              {CC_HEADER.vendor}<span className="sep">·</span>
              <b>{CC_HEADER.value}</b><span className="sep">·</span>
              {CC_HEADER.start} → {CC_HEADER.end}
            </div>
          </div>
          <div className="head-actions">
            <button className="pbtn"><span>{ICO.flow}</span>Audit trail</button>
            <button className="pbtn" onClick={notify}><span>{ICO.send}</span>Notify</button>
            <button className="pbtn primary" onClick={() => navigate('/')}>Return to inbox<span>{ICO.arrowR}</span></button>
          </div>
        </div>

        <CrAction>
          <b>Your action:</b> review live KPIs, action any open deviations, nudge gate owners — Procura keeps this view fresh every 60s.
        </CrAction>

        {/* ── KPIs ─────────────────────────────────────────────── */}
        <div className="setup-block-head" style={{ marginBottom: 0 }}>
          <div className="reco-eyebrow" style={{ margin: 0 }}>Live KPIs</div>
          <AiChip verb="refreshed" ago="60s" />
          <InfoIcon openKey="kpi" currentOpen={openHelp} onToggle={setOpenHelp}>
            KPIs are pulled live from the SES queue, VO register, IKTVA quarterly tracker, and the latest vendor performance evaluation. Tap any tile to inspect its source.
          </InfoIcon>
        </div>
        <div className="cc-kpis">
          {CC_KPIS.map((k, i) => (
            <button
              key={i}
              className={`cc-kpi ${k.tone}`}
              onClick={() => setEvid(KPI_EVIDENCE[i])}
              style={{ cursor: 'pointer', textAlign: 'left', border: 'none', font: 'inherit' }}
            >
              <div className="k-label">{k.label}</div>
              <div className="k-value">{k.value}</div>
              <div className="k-sub">{k.sub}</div>
            </button>
          ))}
        </div>

        {/* ── GATES TIMELINE ───────────────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="ic">{ICO.flow}</div>
              <h3>Contract gates</h3>
              <InfoIcon openKey="gates" currentOpen={openHelp} onToggle={setOpenHelp}>
                Each gate represents a contractual milestone with payment, performance, or handover implications. Done = signed off. Active = currently in progress. Future gates are projected from baseline schedule.
              </InfoIcon>
            </div>
            <span className="count">2 of 6 complete · next: Pre-commissioning</span>
          </div>
          <div className="panel-body tight">
            <div className="gates-line">
              {CC_GATES.map((g) => (
                <div key={g.id} className={`gate-node ${g.done ? 'done' : ''} ${g.active ? 'active' : ''}`}>
                  <div className="gn-dot">{g.done ? '✓' : ''}</div>
                  <div className="gn-label">{g.label}</div>
                  <div className="gn-date">{g.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DEVIATIONS ───────────────────────────────────────── */}
        <div className="panel">
          <div className="panel-head">
            <div className="ph-l">
              <div className="ic">{ICO.shield}</div>
              <h3>Deviations &amp; variations</h3>
              <AiChip verb="surfaced" ago="just now" />
              <InfoIcon openKey="dev" currentOpen={openHelp} onToggle={setOpenHelp}>
                Procura surfaces variation orders, schedule slips, and IKTVA non-conformance the moment they enter the contract record. Open items require CR action — Approve, move to Tracking with a reason, or Reject. Each action is auditable.
              </InfoIcon>
            </div>
            <span className="count">{devs.length} entries · {openCount} open</span>
          </div>
          <div className="panel-body tight">
            <table className="rank-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>What</th>
                  <th>Amount</th>
                  <th>State</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {devs.map((d) => (
                  <tr key={d.id}>
                    <td className="num">{d.when}</td>
                    <td className="bidder">{d.what}</td>
                    <td className="num">{d.amt}</td>
                    <td>
                      <span className={`status-chip ${d.state === 'approved' ? 'endorsed' : d.state === 'tracking' ? 'pending' : d.state === 'rejected' ? 'returned' : 'returned'}`}>
                        {STATE_LABELS[d.state] || d.state}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="link-btn" onClick={() => setEvid(DEV_EVIDENCE[d.id])}>View source</button>
                      {d.state === 'open' && (
                        <>
                          <button className="pbtn tiny primary" onClick={() => approveDev(d)}>Approve</button>
                          <button className="pbtn tiny ghost" onClick={() => investigate(d)}>Investigate</button>
                          <button className="pbtn tiny warn" onClick={() => rejectDev(d)}>Reject</button>
                        </>
                      )}
                      {d.state === 'tracking' && (
                        <button className="pbtn tiny primary" onClick={() => approveDev(d)}>Close as approved</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />
      <EvidenceModal doc={evid} onClose={() => setEvid(null)} />
      <Toast toast={toast} />
    </div>
  );
}
