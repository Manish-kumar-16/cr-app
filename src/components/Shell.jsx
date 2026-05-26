import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProcuraRail from './ProcuraRail';
import { ICO } from './Icons';
import procuraOrb from '../assets/procura-orb.png';

const PAGE_LABELS = {
  '/':                  'Overview',
  '/inbox':             'Inbox',
  '/reviews':           'Reviews',
  '/bidding':           'Bidding',
  '/awards':            'Awards & Sign',
  '/chat':              'Procura · Chat',
  '/create':            'New Service Request',
  '/pa-draft':          'PA Draft Builder',
  '/functional-review': 'Functional Review',
  '/bid-evaluation':    'Bid Evaluation',
  '/award-sign':        'Award & Sign',
  '/templates':         'Templates',
  '/vendors':           'Vendors & Bidders',
  '/clauses':           'Clauses',
  '/insights':          'Procura Insights',
  '/activity':          'Activity Log',
};

/* ─── Active-PA registry — drives the header context strip ──────────
   In production this would come from route state / API. For the demo we
   hardcode the PA associated with each wizard path so the header truly
   reflects "what am I working on right now". */
const PA_BY_PATH = {
  '/pa-draft':          { pa: 'PA-LFPA-0218', title: 'Jubail Hookup & Commissioning · Phase 3', stage: 2, stageLabel: 'PA Draft' },
  '/functional-review': { pa: 'PA-LFPA-0218', title: 'Jubail Hookup & Commissioning · Phase 3', stage: 3, stageLabel: 'Functional Review' },
  '/bid-slate':         { pa: 'PA-LFPA-0241', title: 'Khurais Off-Plot · slate seed',           stage: 4, stageLabel: 'Bid Slate' },
  '/bid-evaluation':    { pa: 'PA-LFPA-0218', title: 'Jubail Hookup & Commissioning · Phase 3', stage: 6, stageLabel: 'Bid Evaluation' },
  '/award-sign':        { pa: 'PA-LFPA-0218', title: 'Jubail Hookup & Commissioning · Phase 3', stage: 7, stageLabel: 'Award & Sign' },
  '/contract':          { pa: 'PA-LFPA-0205', title: 'Berri GOSP Tie-In',                       stage: 7, stageLabel: 'In execution', live: true },
};

const QUEUE_COUNT = { '/inbox': 4, '/reviews': 3, '/bidding': 5, '/awards': 1 };

function HeaderContext({ path, pageLabel, onNavigate }) {
  /* Resolve active PA for any per-PA route (handles /pa-draft/:id, /bid-slate/:id etc.) */
  const paKey = Object.keys(PA_BY_PATH).find((k) => path === k || path.startsWith(k + '/'));
  const activePa = paKey ? PA_BY_PATH[paKey] : null;

  if (activePa) {
    return (
      <div className="cmd-context cmd-context-pa" role="region" aria-label={`Active PA ${activePa.pa}`}>
        <span className="cc-eyebrow">{activePa.live ? 'Live contract' : 'Active PA'}</span>
        <button
          className="cc-pa-chip"
          type="button"
          onClick={() => onNavigate(paKey === '/contract' ? path : '/pa-draft')}
          title={`Open ${activePa.pa}`}
        >
          <span className="cc-pa-code">{activePa.pa}</span>
        </button>
        <span className="cc-pa-title" title={activePa.title}>{activePa.title}</span>
        <span className="cc-pa-stage">
          <span className="cc-pa-stage-dot" aria-hidden="true" />
          {activePa.stageLabel} · <b>{activePa.stage}/7</b>
        </span>
      </div>
    );
  }

  if (path in QUEUE_COUNT) {
    return (
      <div className="cmd-context cmd-context-queue">
        <span className="cc-eyebrow">Workflow</span>
        <span className="cc-page">{pageLabel}</span>
        <span className="cc-pa-stage"><span className="cc-pa-stage-dot is-amber" />{QUEUE_COUNT[path]} items</span>
      </div>
    );
  }

  if (path === '/') {
    return (
      <div className="cmd-context cmd-context-overview">
        <span className="cc-eyebrow">Today</span>
        <span className="cc-page">Workspace overview</span>
        <span className="cc-pa-stage"><span className="cc-pa-stage-dot is-amber" />4 priorities</span>
      </div>
    );
  }

  /* Chat / Create / other */
  return (
    <div className="cmd-context cmd-context-plain">
      <span className="cc-eyebrow">Section</span>
      <span className="cc-page">{pageLabel}</span>
    </div>
  );
}

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [railClosing, setRailClosing] = useState(false);
  const [railOpening, setRailOpening] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fabPeek, setFabPeek] = useState(false);
  const [fabPeekIndex, setFabPeekIndex] = useState(0);
  const profileRef = useRef(null);

  const GENIE_MS = 380;
  const collapseRail = () => {
    if (railClosing || railCollapsed) return;
    setRailClosing(true);
    setTimeout(() => {
      setRailCollapsed(true);
      setRailClosing(false);
    }, GENIE_MS);
  };
  const expandRail = () => {
    if (railOpening || !railCollapsed) return;
    setRailCollapsed(false);
    setRailOpening(true);
    setTimeout(() => setRailOpening(false), GENIE_MS);
  };

  useEffect(() => {
    if (!profileOpen) return;
    const onDoc = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen]);

  /* Idle peek — when rail is collapsed, surface a rotating priority brief
     every 24s for ~6s. Builds presence without being intrusive. */
  const peekBriefs = [
    'Tanajib CE deviation — low bid 13% over CE',
    '8 IKTVA-qualified vendors ready for Khurais',
    'Berri award ready to push to SRC',
    'CE +5% memo playbook ready to draft',
  ];

  const path = location.pathname;
  const pageLabel = PAGE_LABELS[path] || (
    path.startsWith('/contract/') ? 'Contract Cockpit' :
    path.startsWith('/bid-slate/') ? 'Bid Slate · RFP' :
    path === '/create' ? 'New Service Request' :
    path === '/inbox' ? 'Inbox' :
    'Workspace'
  );
  const hideRail = path === '/chat';

  /* Focus mode on PA Draft (and other wizard-style screens):
     - sidebar collapses to give the wizard breathing room
     - rail expands so contextual tips are visible
     Elsewhere: rail collapses to FAB, sidebar stays at user's preference.
     /chat: rail is fully hidden (hideRail handles that). */
  useEffect(() => {
    if (path === '/chat') return;
    const isFocusScreen = path.startsWith('/pa-draft');
    /* eslint-disable react-hooks/set-state-in-effect */
    setRailCollapsed(!isFocusScreen);
    setRailClosing(false);
    setRailOpening(false);
    if (isFocusScreen) setSideCollapsed(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [path]);

  const appClass = [
    'app',
    sideCollapsed ? 'side-collapsed' : '',
    hideRail ? 'no-rail' : '',
    !hideRail && railCollapsed ? 'rail-collapsed' : '',
  ].filter(Boolean).join(' ');

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSideCollapsed(c => !c);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!railCollapsed || hideRail) return;
    const timers = [];
    const schedulePeek = (delay) => {
      timers.push(setTimeout(() => {
        setFabPeek(true);
        timers.push(setTimeout(() => setFabPeek(false), 6000));
      }, delay));
    };
    schedulePeek(4000);
    const interval = setInterval(() => {
      setFabPeekIndex((i) => (i + 1) % peekBriefs.length);
      schedulePeek(0);
    }, 22000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railCollapsed, hideRail]);

  return (
    <div className={appClass}>
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        collapsed={sideCollapsed}
        onToggleCollapse={() => setSideCollapsed(c => !c)}
      />

      <main className="main">
        <div className="top top-v2" role="banner">
          {/* 1. Context strip — page-aware. Shows the PA you're working on (with stage) on per-PA screens; the queue name + count on list screens; just the page label elsewhere. */}
          <HeaderContext path={path} pageLabel={pageLabel} onNavigate={navigate} />

          {/* 2. Command palette ⌘K — real input wrapped in label for click-to-focus */}
          <label className="cmd-palette" htmlFor="cmd-input" title="Search or ask Procura · ⌘K">
            <span className="cmd-ico cmd-sparkle" aria-hidden="true">{ICO.sparkle || ICO.search}</span>
            <input
              id="cmd-input"
              className="cmd-input"
              type="search"
              placeholder="Search or ask Procura…"
              autoComplete="off"
              spellCheck="false"
              aria-label="Search or ask Procura"
            />
            <kbd className="cmd-kbd" aria-hidden="true">⌘K</kbd>
          </label>

          <span className="cmd-spacer" aria-hidden="true"></span>

          {/* 4. Notifications */}
          <button
            className="cmd-icbtn notif-btn"
            type="button"
            title="Notifications"
            aria-label="Notifications, 3 unread"
          >
            {ICO.bell}
            <span className="notif-dot"></span>
          </button>

          {/* 5. Profile avatar with online dot + sign-out popover */}
          <div className="cmd-profile-wrap" ref={profileRef}>
            <button
              className="cmd-profile"
              type="button"
              title="Mohammed Al-Ghamdi · CR · CD-PSCM"
              aria-label="Profile and account menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(o => !o)}
            >
              <span className="cmd-av">MG</span>
              <span className="cmd-online" aria-hidden="true"></span>
            </button>
            {profileOpen && (
              <div className="cmd-profile-menu" role="menu">
                <span className="cmd-profile-tail" aria-hidden="true"></span>

                <div className="cmd-profile-header">
                  <div className="cmd-profile-av-wrap">
                    <div className="cmd-profile-av-lg">MG</div>
                    <span className="cmd-profile-av-online" aria-hidden="true"></span>
                  </div>
                  <div className="cmd-profile-id">
                    <div className="cmd-profile-name">Mohammed Al-Ghamdi</div>
                    <div className="cmd-profile-role">Contract Representative</div>
                    <div className="cmd-profile-meta">
                      CD-PSCM
                    </div>
                  </div>
                </div>

                <div className="cmd-profile-stats">
                  <div className="stat">
                    <div className="stat-v">4</div>
                    <div className="stat-l">Assigned</div>
                  </div>
                  <div className="stat">
                    <div className="stat-v">7</div>
                    <div className="stat-l">Drafts</div>
                  </div>
                  <div className="stat">
                    <div className="stat-v">3</div>
                    <div className="stat-l">Awaiting</div>
                  </div>
                </div>

                <div className="cmd-profile-group">
                  <button type="button" role="menuitem" className="cmd-profile-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                    </svg>
                    <span className="cmd-profile-item-l">Your profile</span>
                  </button>
                  <button type="button" role="menuitem" className="cmd-profile-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.18.4.27.84.27 1.27" />
                    </svg>
                    <span className="cmd-profile-item-l">Preferences</span>
                  </button>
                  <button type="button" role="menuitem" className="cmd-profile-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="cmd-profile-item-l">Send feedback</span>
                  </button>
                </div>

                <div className="cmd-profile-sep"></div>

                <button
                  type="button"
                  role="menuitem"
                  className="cmd-profile-item cmd-profile-item-danger"
                  onClick={() => { setProfileOpen(false); navigate('/login'); }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  <span className="cmd-profile-item-l">Sign out</span>
                </button>

                <div className="cmd-profile-foot">
                  Aramco iProcurement · v2026.05
                </div>
              </div>
            )}
          </div>
        </div>

        <Outlet />
      </main>

      {!hideRail && !railCollapsed && (
        <ProcuraRail
          onCollapse={collapseRail}
          animClass={railClosing ? 'rail-genie-out' : railOpening ? 'rail-genie-in' : ''}
        />
      )}

      {!hideRail && railCollapsed && (
        <div className="procura-fab-wrap">
          {/* Idle peek bubble — auto-rotates every 24s, dismissible */}
          {fabPeek && (
            <div className="procura-peek" role="status">
              <span className="procura-peek-eyebrow">
                <span className="procura-peek-dot" aria-hidden="true"></span>
                Procura · brief
              </span>
              <div className="procura-peek-text">{peekBriefs[fabPeekIndex]}</div>
              <button
                type="button"
                className="procura-peek-close"
                aria-label="Dismiss"
                onClick={(e) => { e.stopPropagation(); setFabPeek(false); }}
              >×</button>
              <span className="procura-peek-tail" aria-hidden="true"></span>
            </div>
          )}

          {/* Hover quick-actions — slim card with verbs */}
          <div className="procura-quick" aria-hidden="true">
            <button type="button" className="procura-quick-item" onClick={() => expandRail()}>
              <span className="procura-quick-ico">{ICO.inbox}</span>
              Brief my inbox
            </button>
            <button type="button" className="procura-quick-item" onClick={() => expandRail()}>
              <span className="procura-quick-ico">{ICO.shield}</span>
              Find OOK overlap
            </button>
            <button type="button" className="procura-quick-item" onClick={() => expandRail()}>
              <span className="procura-quick-ico">{ICO.doc}</span>
              Draft minutes
            </button>
            <div className="procura-quick-sep"></div>
            <button type="button" className="procura-quick-item procura-quick-primary" onClick={() => expandRail()}>
              <span className="procura-quick-ico">{ICO.sparkle}</span>
              Open Procura
            </button>
          </div>

          <button
            type="button"
            className="procura-fab"
            onClick={() => expandRail()}
            title="Open Procura — 4 priority briefs ready"
            aria-label="Open Procura — 4 priority briefs ready"
          >
            <span className="procura-fab-floor" aria-hidden="true"></span>
            <span className="procura-fab-halo" aria-hidden="true"></span>
            <span className="procura-fab-pulse" aria-hidden="true"></span>
            <img
              src={procuraOrb}
              alt=""
              className="procura-fab-img"
              draggable="false"
              aria-hidden="true"
            />
            <span className="procura-fab-dot" aria-hidden="true"></span>
            <span className="procura-fab-badge" aria-hidden="true">4</span>
          </button>
        </div>
      )}
    </div>
  );
}
