/* ═══════════════════════════════════════════════════════════════════
   Workspace — CR Dashboard (main page)
   KPIs  ·  Action Cards  ·  Pipeline  ·  Inbox  ·  Gates  ·  Feed
   ═══════════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { PA_STATUS, STATUS_LABELS, usePaStatusMap } from '../lib/paStatus';

/* Map canonical status → workspace inbox "status-pill" tone class for visual continuity. */
const PILL_TONE = {
  intake: 'info', 'pa-draft': 'warning', functional: 'warning', 'bid-slate': 'warning',
  bidding: 'info', 'bid-eval': 'warning', 'award-sign': 'success', executed: 'success',
  returned: 'critical', 'on-hold': 'critical',
};
const ROUTE_FOR_STATUS = {
  intake: '/pa-draft', 'pa-draft': '/pa-draft', functional: '/functional-review',
  'bid-slate': '/bid-slate/PA-LFPA-0241', bidding: '/bid-evaluation', 'bid-eval': '/bid-evaluation',
  'award-sign': '/award-sign', executed: '/contract/PA-LFPA-0205',
  returned: '/inbox', 'on-hold': '/inbox',
};
import {
  KPI_DATA,
  ACTION_CARDS,
  PIPELINE_STAGES,
  INBOX_ROWS,
  GATES_PENDING,
  ACTIVITY_FEED,
} from '../data/constants';
/* ICO available from '../components/Icons' if needed */

/* ── Helpers ────────────────────────────────────────────────────── */

/** Returns "morning" / "afternoon" / "evening" based on current hour */
const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

/** Returns current day name, e.g. "Sunday" */
const getDayName = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' });

/* ── Sparkline ──────────────────────────────────────────────────── */

const Sparkline = ({ data, color }) => {
  const w = 60, h = 24, pad = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    pad + ((max - v) / range) * (h - pad * 2),
  ]);
  const line = pts.map((p) => p.join(',')).join(' L ');
  const area = `M ${pts[0].join(',')} L ${line} L ${w},${h} L 0,${h} Z`;
  const last = pts[pts.length - 1];
  const gradId = `sg-${color.replace('#', '')}`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="area" fill={`url(#${gradId})`} d={area} />
      <polyline
        className="line"
        stroke={color}
        fill="none"
        strokeWidth="1.5"
        points={pts.map((p) => p.join(',')).join(' ')}
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  );
};

/* ── KPI Sub Renderer ───────────────────────────────────────────── */

const KpiSub = ({ text, type }) => {
  if (!text) return null;
  // type: 'up' | 'neu' | 'warn'
  const cls = type === 'up' ? 'up' : type === 'warn' ? 'warn' : 'neu';
  return (
    <div className="sub">
      {type === 'up' && <span className="up arrow">&#9650;</span>}
      {type === 'warn' && <span className="marker-dot"></span>}
      <span className={cls}>{text}</span>
    </div>
  );
};

/* ── Action Card Icon Mapper ────────────────────────────────────── */

const ActionIcon = ({ icon }) => {
  const icons = {
    doc: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
    review: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    chart: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h9V3" />
      </svg>
    ),
    award: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7" />
        <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  };
  return <div className="ico-wrap">{icons[icon] || icons.doc}</div>;
};

/* ── Gate / Feed Action Icons ───────────────────────────────────── */

const GateActionIcon = ({ variant, title, onClick }) => {
  const icons = {
    approve: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    src: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
    grid: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    arrow: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    ),
  };
  return (
    <button
      className={`action-mini icon${variant === 'src' ? ' src' : ''}${variant === 'ghost' || variant === 'grid' || variant === 'calendar' ? ' ghost' : ''}`}
      title={title}
      onClick={onClick}
    >
      {icons[variant] || icons.arrow}
    </button>
  );
};

/* ── Feed Activity Icon ─────────────────────────────────────────── */

const FeedIcon = ({ icon }) => {
  const icons = {
    check: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    send: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
      </svg>
    ),
    sparkle: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6Z" />
      </svg>
    ),
    taskCheck: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    cal: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  };
  return <div className="av">{icons[icon] || icons.check}</div>;
};

/* (SrcTagIcon and FeedBody removed — feed now uses inline composition from flat fields) */

/* ── Risk Bar ───────────────────────────────────────────────────── */

const RiskBar = ({ level, label }) => (
  <span className={`risk-bar ${level}`}>
    <span className="bars">
      <span className="seg"></span>
      <span className="seg"></span>
      <span className="seg"></span>
    </span>
    <span className="lbl">{label}</span>
  </span>
);

/* ═══════════════════════════════════════════════════════════════════
   WORKSPACE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function Workspace() {
  const navigate = useNavigate();
  const statusMap = usePaStatusMap();
  const [inboxTab, setInboxTab] = useState('All');
  const [gatesTab, setGatesTab] = useState('Today');
  const [density, setDensity] = useState('comfortable');
  const dateRanges = ['7D', '30D', '90D', 'YTD'];
  const [dateRange, setDateRange] = useState('30D');
  const layouts = ['Spacious', 'Compact'];
  const [layout, setLayout] = useState('Compact');
  const cycleRange = () => setDateRange((r) => dateRanges[(dateRanges.indexOf(r) + 1) % dateRanges.length]);
  const cycleLayout = () => setLayout((l) => layouts[(layouts.indexOf(l) + 1) % layouts.length]);

  const inboxTabs = ['All', 'LFPA', 'SFPA', '≥ $50M'];
  const gatesTabs = ['Today', 'This week'];

  const stageRoutes = {
    inbox: '/',
    'pa-draft': '/pa-draft/PA-LFPA-0218',
    review: '/functional-review',
    solicit: '/bid-slate/PA-LFPA-0241',
    bidding: '/bid-slate/PA-LFPA-0241',
    evaluate: '/bid-evaluation',
    award: '/award-sign',
  };

  /* ── 1. Dashboard Header ──────────────────────────────────────── */

  const renderHeader = () => (
    <div className="dash-head">
      <div className="dash-head-main">
        <div className="dash-head-title">
          <div className="salute">
            <span>{getDayName()} {getTimeOfDay()}</span>
          </div>
          <h1>Today at a glance</h1>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-secondary"
            title={`Date range — cycle (currently ${dateRange})`}
            aria-label={`Date range, currently ${dateRange}, click to cycle`}
            onClick={cycleRange}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{dateRange}</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            title={`Layout — cycle (currently ${layout})`}
            aria-label={`Layout, currently ${layout}, click to cycle`}
            aria-pressed={layout === 'Compact'}
            onClick={cycleLayout}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" />
              <rect x="14" y="3" width="7" height="18" />
            </svg>
            <span>{layout}</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="dash-head-meta">
        <div className="summary-chips" role="list" aria-label="Today's procurement summary">
          <button type="button" className="chip" role="listitem" aria-label="4 new purchase requests">
            <span className="dot" style={{ background: '#00A3E0' }}></span>
            <b>4</b>&nbsp;new PRs
          </button>
          <button type="button" className="chip" role="listitem" aria-label="3 drafts to review">
            <span className="dot" style={{ background: '#5E6878' }}></span>
            <b>3</b>&nbsp;drafts
          </button>
          <button type="button" className="chip" role="listitem" aria-label="1 award queued for SRC">
            <span className="dot" style={{ background: '#00843D' }}></span>
            <b>1</b>&nbsp;award (SRC)
          </button>
          <button type="button" className="chip" role="listitem" aria-label="28 active contracts">
            <span className="dot" style={{ background: '#00867B' }}></span>
            <b>28</b>&nbsp;active
          </button>
        </div>
        <button
          type="button"
          className="suggest-link"
          aria-label="View Procura's 4 suggestions"
          title="Open Procura — 4 priority briefs ready for you"
          onClick={() => navigate('/chat')}
        >
          <span className="suggest-ico" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
            </svg>
          </span>
          Procura has <b>4 suggestions</b>{' '}
          <span className="arrow" aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );

  /* ── 2. KPI Grid ──────────────────────────────────────────────── */

  const renderKPIs = () => (
    <div className="kpi-grid">
      {KPI_DATA.map((kpi) => (
        <button
          className="kpi"
          type="button"
          key={kpi.id}
          onClick={() => kpi.link && navigate(kpi.link)}
          aria-label={`${kpi.label} ${kpi.value} — ${kpi.sub}`}
        >
          <div className="row1">
            <span className="label">{kpi.label}</span>
            {kpi.trend && (
              <span className={`trend-pill ${kpi.trend.dir}`}>
                {kpi.trend.dir === 'up' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M7 14l5-5 5 5" />
                  </svg>
                )}
                {kpi.trend.dir === 'down' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M7 10l5 5 5-5" />
                  </svg>
                )}
                {kpi.trend.dir === 'flat' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M5 12h14" />
                  </svg>
                )}
                {kpi.trend.pct}
              </span>
            )}
          </div>
          <div className="body">
            <div className="left">
              <div className="v">{kpi.value}</div>
              <KpiSub text={kpi.sub} type={kpi.subType} />
            </div>
            <Sparkline data={kpi.spark} color={kpi.color} />
          </div>
        </button>
      ))}
    </div>
  );

  /* ── 3. Action Cards ──────────────────────────────────────────── */

  const renderActionCards = () => (
    <div className="act-grid">
      {ACTION_CARDS.map((card) => (
        <button
          className="act-card"
          key={card.id}
          style={{ '--accent': card.accent, '--accent-bg': card.accentBg }}
          onClick={() => navigate(card.link)}
        >
          <span
            className="info-ico"
            title={card.info}
            aria-label={`About ${card.title}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <div className="head">
            <ActionIcon icon={card.icon} />
            <div className="head-body">
              <h3>{card.title}</h3>
              <div className="h-sub">{card.subtitle}</div>
            </div>
          </div>
          {card.aging && (
            <div className="act-aging">
              <span className={`aging-dot ${card.aging.dot}`}></span>
              <span className="aging-meta">{card.aging.meta}</span>
            </div>
          )}
          <div className="cta-row">
            <span className="btn btn-primary">
              {card.cta}{' '}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>
          <span className="corner-accent"></span>
        </button>
      ))}
    </div>
  );

  /* ── 4. Contract Pipeline ─────────────────────────────────────── */

  const renderPipeline = () => (
    <div className="pipeline">
      <div className="pipeline-head">
        <h3>
          <span className="section-ico section-ico-pipeline" aria-hidden="true">{ICO.flow}</span>
          Contract pipeline <span className="count">28 active</span>
        </h3>
        <div className="legend">
          <span>
            <span className="dot" style={{ background: 'var(--green)' }}></span>
            On track
          </span>
          <span>
            <span className="dot" style={{ background: 'var(--amber)' }}></span>
            Watch
          </span>
          <span>
            <span className="dot" style={{ background: 'var(--red)' }}></span>
            Overdue
          </span>
        </div>
      </div>
      <div className="stages">
        {PIPELINE_STAGES.map((stage) => (
          <div
            className="stage"
            key={stage.id}
            data-phase={stage.phase}
            role="button"
            tabIndex={0}
            onClick={() => navigate(stageRoutes[stage.id] || '/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(stageRoutes[stage.id] || '/');
              }
            }}
            aria-label={`Open ${stage.name} stage`}
          >
            {stage.urgent > 0 && (
              <span className="urgent-dot">
                <span className="pip"></span>
                {stage.urgent}
              </span>
            )}
            <div className="ph" title={stage.phase}>{stage.phase}</div>
            <div className="nm" title={stage.name}>{stage.name}</div>
            <div className="ct" title={`${stage.count} contracts · SLA ${stage.sla}`}>
              {stage.count}
              <span className="sla">{stage.sla}</span>
            </div>
            {stage.value && <div className="stage-val" title={`${stage.value} active value`}>{stage.value}</div>}
            {stage.avatars && stage.avatars.length > 0 && (
              <div className="stack">
                {stage.avatars.map((initials, i) => (
                  <span className="chip" key={i}>{initials}</span>
                ))}
                {stage.overflow && (
                  <span className="chip more">+{stage.overflow}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── 5. PR Inbox Table ────────────────────────────────────────── */

  const renderInbox = () => (
    <div className="tbl-card">
      <div className="tbl-head">
        <h3>
          <span className="section-ico section-ico-inbox" aria-hidden="true">{ICO.inbox}</span>
          Inbox <span className="count">4 new &middot; 12 total</span>
        </h3>
        <div className="tbl-head-right">
          <div className="tabs-underline">
            {inboxTabs.map((tab) => (
              <button
                key={tab}
                className={`tab${inboxTab === tab ? ' active' : ''}`}
                onClick={() => setInboxTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="density-toggle" role="group" aria-label="Row density">
            <button
              type="button"
              className={density === 'comfortable' ? 'active' : ''}
              title="Comfortable"
              aria-label="Comfortable density"
              aria-pressed={density === 'comfortable'}
              onClick={() => setDensity('comfortable')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
            </button>
            <button
              type="button"
              className={density === 'compact' ? 'active' : ''}
              title="Compact"
              aria-label="Compact density"
              aria-pressed={density === 'compact'}
              onClick={() => setDensity('compact')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 10h18M3 14h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className={'tbl-body density-' + density}>
      <table className="tbl">
        <colgroup>
          <col className="col-sel" />
          <col className="col-prtitle" />
          <col className="col-type" />
          <col className="col-prop" />
          <col className="col-value" />
          <col className="col-risk" />
          <col className="col-status" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th aria-label="Select all">
              <span className="row-sel" role="checkbox" aria-checked="false" tabIndex={0}></span>
            </th>
            <th className="sortable sorted desc">
              <span className="sort-ind">PR / Title <span className="sort-arrow">▾</span></span>
            </th>
            <th>Type</th>
            <th>Proponent</th>
            <th className="sortable">
              <span className="sort-ind">Value <span className="sort-arrow">▾</span></span>
            </th>
            <th>Risk</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {INBOX_ROWS.map((row) => {
            const canon = statusMap[row.code];
            const status = canon?.status || PA_STATUS.INTAKE;
            const label = STATUS_LABELS[status] || status;
            const pillTone = PILL_TONE[status] || 'info';
            const link = ROUTE_FOR_STATUS[status] || '/inbox';
            return (
            <tr key={row.id}>
              <td>
                <span className="row-sel" role="checkbox" aria-checked="false" tabIndex={0} onClick={(e) => e.stopPropagation()}></span>
              </td>
              <td>
                <div className="code" title={canon?.pa || row.code}>{canon?.pa || row.code}</div>
                <div className="title" title={row.title}>{row.title}</div>
              </td>
              <td>
                <span className={`type-badge ${row.typeClass}`} title={row.type}>{row.type}</span>
              </td>
              <td>
                <div className="by" title={`${row.proponent} · ${row.dept}`}>
                  <span className="av" title={row.proponent}>{row.avatar}</span>
                  <span className="by-text">{row.proponent} &middot; {row.dept}</span>
                </div>
              </td>
              <td>
                <span className="val" title={row.value}>{row.value}</span>
              </td>
              <td>
                <RiskBar level={row.risk} label={row.riskLabel} />
              </td>
              <td>
                <span className={`status-pill ${pillTone}`}>
                  <span className="d"></span>
                  {label}
                </span>
              </td>
              <td>
                <span className="actions-cell">
                  <button
                    className="action-mini icon ghost"
                    title="Open"
                    onClick={(e) => { e.stopPropagation(); navigate(link); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </span>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
      </div>
    </div>
  );

  /* ── 6a. Gates Pending ────────────────────────────────────────── */

  const renderGates = () => (
    <div className="tbl-card">
      <div className="tbl-head">
        <h3>
          <span className="section-ico section-ico-gates" aria-hidden="true">{ICO.shield}</span>
          Gates pending <span className="count">{GATES_PENDING.length}</span>
        </h3>
        <div className="tabs-underline">
          {gatesTabs.map((tab) => (
            <button
              key={tab}
              className={`tab${gatesTab === tab ? ' active' : ''}`}
              onClick={() => setGatesTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <table className="tbl tbl-compact">
        <colgroup>
          <col style={{ width: '34%' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '52px' }} />
          <col style={{ width: '78px' }} />
          <col style={{ width: '56px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Gate</th>
            <th>Contract</th>
            <th>Owner</th>
            <th>Triggered</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {GATES_PENDING.map((gate) => (
            <tr key={gate.id}>
              <td>
                <div className="title" title={gate.gate}>{gate.gate}</div>
              </td>
              <td>
                <span className="code-inline" title={`${gate.code} · ${gate.name}`}>
                  <span className="code" title={gate.code}>{gate.code}</span>
                  <span className="nm" title={gate.name}>{gate.name}</span>
                </span>
              </td>
              <td>
                <span className="gate-assignee" title={`Assigned to ${gate.assignee}`}>{gate.assignee}</span>
              </td>
              <td title={gate.time}>{gate.time}</td>
              <td>
                <span className="actions-cell">
                  <GateActionIcon
                    variant={gate.actionType}
                    title={gate.gate}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(gate.link);
                    }}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ── 6b. Activity Feed ────────────────────────────────────────── */

  const renderFeed = () => (
    <div className="feed-card">
      <div className="feed-head">
        <h3>
          <span className="section-ico section-ico-activity" aria-hidden="true">{ICO.clock}</span>
          Activity
        </h3>
        <button className="more">View all</button>
      </div>
      <div className="feed-list">
        {ACTIVITY_FEED.map((item) => (
          <div className="feed-item" key={item.id}>
            <FeedIcon icon={item.icon} />
            <div className="body" title={`${item.actor} ${item.action} ${item.target} — ${item.detail}`}>
              <div className="t">
                <b title={item.actor}>{item.actor}</b>{' '}
                {item.action}{' '}
                <span className="lnk" title={item.target}>{item.target}</span>{' '}
                {item.detail}
              </div>
              <div className="m">
                <span className="time" title={item.time}>{item.time}</span>
              </div>
            </div>
            <button className="feed-ack" type="button" title="Acknowledge / dismiss" aria-label="Acknowledge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className={'dash dash-range-' + dateRange.toLowerCase() + ' dash-layout-' + layout.toLowerCase()}>
      {renderHeader()}
      {renderKPIs()}
      {renderActionCards()}
      {renderPipeline()}
      {renderInbox()}
      <div className="two-up">
        {renderGates()}
        {renderFeed()}
      </div>
    </div>
  );
}
