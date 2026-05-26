import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { INBOX_ROWS } from '../data/constants';
import { PA_STATUS, STATUS_LABELS, STATUS_TONE, usePaStatusMap } from '../lib/paStatus';

/* Queue configs — filter by canonical PA_STATUS values (single source of truth). */
const QUEUE_CONFIGS = {
  inbox: {
    title: 'Inbox',
    eyebrow: 'Workflow · Intake',
    h1: 'PRs awaiting your action',
    sub: 'New PRs assigned to you. Pick one to begin a PA draft, or hand back to the proponent.',
    statuses: [PA_STATUS.INTAKE],
    primaryFor: PA_STATUS.INTAKE,
    primaryLabel: 'Start draft',
    primaryLink: () => '/pa-draft',
    emptyHint: 'No new PRs in your queue — nice.',
  },
  reviews: {
    title: 'Reviews',
    eyebrow: 'Workflow · Functional review',
    h1: 'PAs in functional review',
    sub: 'Concurrence lanes (Law · CP&CCD · SMPCAD · Tech · IKTVA) currently routing. Open any to track or nudge.',
    statuses: [PA_STATUS.PA_DRAFT, PA_STATUS.FUNCTIONAL],
    primaryFor: PA_STATUS.FUNCTIONAL,
    primaryLabel: 'Open tracker',
    primaryLink: (r) => r.status === PA_STATUS.PA_DRAFT ? '/pa-draft' : '/functional-review',
    emptyHint: 'No PAs awaiting concurrence right now.',
  },
  bidding: {
    title: 'Bidding',
    eyebrow: 'Workflow · Solicit & evaluate',
    h1: 'PAs in bidding & evaluation',
    sub: 'RFPs currently being assembled, issued, or evaluated. Open to monitor or work the composite ranking.',
    statuses: [PA_STATUS.BID_SLATE, PA_STATUS.BIDDING, PA_STATUS.BID_EVAL],
    primaryFor: PA_STATUS.BID_EVAL,
    primaryLabel: 'Open console',
    primaryLink: (r) => r.status === PA_STATUS.BID_SLATE ? '/bid-slate/' + (r.pa || r.code) : r.status === PA_STATUS.BID_EVAL ? '/bid-evaluation' : '/bid-evaluation',
    emptyHint: 'No active bid windows.',
  },
  awards: {
    title: 'Awards & Sign',
    eyebrow: 'Workflow · Award · SRC · Sign',
    h1: 'PAs ready to award or sign',
    sub: 'Award packets to compile and signed PAs to issue.',
    statuses: [PA_STATUS.AWARD_SIGN],
    primaryFor: PA_STATUS.AWARD_SIGN,
    primaryLabel: 'Build award',
    primaryLink: () => '/award-sign',
    emptyHint: 'No PAs awaiting award action.',
  },
};

/* Supplementary demo rows so every queue has realistic depth. */
const EXTRA_ROWS = [
  { id: 'pr7',  code: 'PR-2026-04425', title: 'Berri GOSP Tie-In · Phase 2',       type: 'MP-IK-LSTK', typeClass: 'mp',  proponent: 'Mariam Al-Qassim',   dept: 'D&CE',  avatar: 'MQ', value: '$48.2M', risk: 'md', riskLabel: 'Med' },
  { id: 'pr8',  code: 'PR-2026-04419', title: 'Shaybah Crude · Pipeline Upgrade', type: 'MP-IK-LSTK', typeClass: 'mp',  proponent: 'Khalid Al-Faraj',    dept: 'GO&PD', avatar: 'KF', value: '$112M',  risk: 'hi', riskLabel: 'Hi · SRC' },
  { id: 'pr9',  code: 'PR-2026-04402', title: 'Hawiyah Gas Plant · Award memo',   type: 'MP-IK-LSPB', typeClass: 'mp',  proponent: 'Sara Bin-Saleh',     dept: 'GO&PD', avatar: 'SB', value: '$68.4M', risk: 'hi', riskLabel: 'Hi · SRC' },
  { id: 'pr10', code: 'PR-2026-04391', title: 'Ras Tanura T-9 · Catalyst loading',type: 'MP-IK-LSTK', typeClass: 'mp',  proponent: 'Tariq Al-Mutairi',   dept: 'D&CE',  avatar: 'TM', value: '$22.1M', risk: 'md', riskLabel: 'Med' },
  { id: 'pr11', code: 'PR-2026-04380', title: 'Manifa Wells Tie-In · LSTK',       type: 'MP-IK-LSTK', typeClass: 'mp',  proponent: 'Lina Al-Harbi',      dept: 'NAPD',  avatar: 'LH', value: '$84.7M', risk: 'hi', riskLabel: 'Hi · SRC' },
];

/* Strip legacy `status`/`statusType`/`link` from INBOX_ROWS — canonical status comes from paStatus registry. */
const BASE_ROWS = [...INBOX_ROWS, ...EXTRA_ROWS].map((r) => {
  /* eslint-disable no-unused-vars */
  const { status, statusType, link, ...rest } = r;
  /* eslint-enable no-unused-vars */
  return rest;
});

const RISK_LABEL = { hi: 'Hi', md: 'Med', lo: 'Low' };

export default function Queue({ which }) {
  const navigate = useNavigate();
  const cfg = QUEUE_CONFIGS[which];
  const statusMap = usePaStatusMap();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [riskFilter, setRiskFilter] = useState('all');

  /* Merge canonical status into each row */
  const enrichedRows = useMemo(() =>
    BASE_ROWS.map((r) => {
      const s = statusMap[r.code] || {};
      return { ...r, status: s.status || PA_STATUS.INTAKE, pa: s.pa };
    }),
  [statusMap]);

  const rows = useMemo(() => {
    let r = enrichedRows.filter((row) => cfg.statuses.includes(row.status));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      r = r.filter((row) =>
        row.code.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.proponent.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') r = r.filter((row) => row.risk === riskFilter);
    if (sortBy === 'value') {
      r = [...r].sort((a, b) => parseFloat(b.value.replace(/[^0-9.]/g, '')) - parseFloat(a.value.replace(/[^0-9.]/g, '')));
    } else if (sortBy === 'risk') {
      const order = { hi: 0, md: 1, lo: 2 };
      r = [...r].sort((a, b) => order[a.risk] - order[b.risk]);
    }
    return r;
  }, [cfg, query, sortBy, riskFilter, enrichedRows]);

  const totalValue = useMemo(() => {
    const sum = rows.reduce((s, r) => s + parseFloat(r.value.replace(/[^0-9.]/g, '')), 0);
    return sum >= 1000 ? `$${(sum / 1000).toFixed(1)}B` : `$${sum.toFixed(1)}M`;
  }, [rows]);

  return (
    <div className="page">
      <div className="wrap">

        <div className="page-head">
          <div className="title-block">
            <div className="eyebrow"><span className="dot"></span>{cfg.eyebrow}</div>
            <h1>{cfg.h1}</h1>
            <div className="head-meta">
              <b>{rows.length}</b> item{rows.length === 1 ? '' : 's'}<span className="sep">·</span>
              <b>{totalValue}</b> combined value<span className="sep">·</span>
              {cfg.sub}
            </div>
          </div>
          <div className="head-actions">
            <button className="pbtn" onClick={() => navigate('/')}>
              {ICO.sparkle}<span>Back to overview</span>
            </button>
          </div>
        </div>

        {/* ── Queue toolbar ────────────────────────────────────── */}
        <div className="queue-toolbar">
          <div className="qt-search">
            {ICO.search || ICO.eye}
            <input
              type="text"
              placeholder={`Search ${cfg.title.toLowerCase()} — PR code, title, proponent…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && <button className="qt-clear" onClick={() => setQuery('')} aria-label="Clear">×</button>}
          </div>
          <div className="qt-filters">
            <div className="seg">
              {['all', 'hi', 'md', 'lo'].map((r) => (
                <button
                  key={r}
                  className={'seg-btn ' + (riskFilter === r ? 'is-on' : '')}
                  onClick={() => setRiskFilter(r)}
                >{r === 'all' ? 'All risk' : RISK_LABEL[r]}</button>
              ))}
            </div>
            <div className="seg">
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'value', label: 'By value' },
                { id: 'risk', label: 'By risk' },
              ].map((s) => (
                <button
                  key={s.id}
                  className={'seg-btn ' + (sortBy === s.id ? 'is-on' : '')}
                  onClick={() => setSortBy(s.id)}
                >{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Queue list ───────────────────────────────────────── */}
        {rows.length === 0 ? (
          <div className="queue-empty">
            <div className="qe-ico">{ICO.check}</div>
            <h3>{cfg.emptyHint}</h3>
            <p>Try clearing filters, or jump back to the overview.</p>
            <button className="pbtn primary" onClick={() => navigate('/')}>Back to overview</button>
          </div>
        ) : (
          <div className="queue-list">
            {rows.map((r) => {
              const tone = STATUS_TONE[r.status] || 'pending';
              const label = STATUS_LABELS[r.status] || r.status;
              const link = cfg.primaryLink(r);
              return (
                <div key={r.id} className={'queue-row risk-' + r.risk}>
                  <div className="qr-l">
                    <div className={'qr-avatar bg-' + (r.typeClass || 'mp')}>{r.avatar}</div>
                    <div className="qr-id">
                      <div className="qr-code">{r.pa || r.code}</div>
                      <span className={'qr-type ' + (r.typeClass || 'mp')}>{r.type}</span>
                    </div>
                  </div>
                  <div className="qr-m">
                    <div className="qr-title">{r.title}</div>
                    <div className="qr-meta">
                      <span>{r.proponent} · <b>{r.dept}</b></span>
                      <span className="sep">·</span>
                      <span><b>{r.value}</b></span>
                      <span className="sep">·</span>
                      <span className={'qr-risk risk-' + r.risk}>{r.riskLabel}</span>
                    </div>
                  </div>
                  <div className="qr-r">
                    <span className={'status-chip ' + tone}>{label}</span>
                    <div className="qr-actions">
                      <button className="pbtn xs" onClick={() => navigate(link)}>{ICO.eye}<span>Open</span></button>
                      <button className="pbtn xs primary" onClick={() => navigate(link)}>{cfg.primaryLabel}<span>{ICO.arrowR}</span></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
