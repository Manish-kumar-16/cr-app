import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ICO } from './Icons';
import {
  PINNED_CONTRACTS,
  BIDDING_CONTRACTS,
  RECENT_CONTRACTS,
  CHAT_THREADS,
  CHAT_CAT,
} from '../data/constants';
import ChatAllModal from './ChatAllModal';
import logoSrc from '../assets/logo-sidebar.png';

/* ---- Route mapping for workflow nav rows ---- */
const WORKFLOW_ROUTES = {
  overview: '/overview',
  inbox:    '/inbox',
  reviews:  '/reviews',
  bidding:  '/bidding',
  awards:   '/awards',
};

const LIB_ROUTES = {
  templates: '/templates',
  vendors:   '/vendors',
  clauses:   '/clauses',
  insights:  '/insights',
  activity:  '/activity',
};

export default function Sidebar({ activeId, onSelect, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  /* Tab state derives from path so the rail Chat tab stays active on /chat */
  const tab = path === '/chat' ? 'chat' : 'create';
  const setTab = (next) => {
    if (next === 'chat') navigate('/chat');
    else if (next === 'create' && path === '/chat') navigate('/');
  };

  /* Determine which workflow nav row is active based on current route.
     Only highlight when path exactly matches a workflow route; /chat and
     other non-workflow paths should not light up any row. */
  const activeNav = Object.entries(WORKFLOW_ROUTES)
    .find(([, route]) => route === path)?.[0] || null;

  const activeLib = Object.entries(LIB_ROUTES)
    .find(([, route]) => route === path)?.[0] || null;

  const isChat = path === '/chat';

  /* Chat-mode local state: pin set + search query + "view all" modal */
  const [pinnedIds, setPinnedIds] = useState(
    () => new Set(CHAT_THREADS.filter((t) => t.pinned).map((t) => t.id))
  );
  const [chatQuery, setChatQuery] = useState('');
  const [allOpen, setAllOpen] = useState(false);

  const togglePin = (id) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredThreads = useMemo(() => {
    const q = chatQuery.trim().toLowerCase();
    if (!q) return CHAT_THREADS;
    return CHAT_THREADS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.snippet.toLowerCase().includes(q) ||
        CHAT_CAT[t.cat]?.label.toLowerCase().includes(q)
    );
  }, [chatQuery]);

  const pinnedThreads = filteredThreads.filter((t) => pinnedIds.has(t.id));
  const recentThreads = filteredThreads.filter((t) => !pinnedIds.has(t.id));

  return (
    <aside className={'side ' + (collapsed ? 'collapsed' : '')}>
      {/* Collapse toggle */}
      {onToggleCollapse && (
        <button
          className="collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar  ⌘\\' : 'Collapse sidebar  ⌘\\'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          data-label={collapsed ? 'Expand  ⌘\\' : 'Collapse  ⌘\\'}
        >
          {collapsed ? ICO.chevR : ICO.chevL}
        </button>
      )}

      {/* Brand header */}
      <div className="brand">
        <div className="mark">
          <img src={logoSrc} alt="iProcurement" className="logo-img" />
        </div>
        <div>
          <div className="name">Aramco iProcurement</div>
          <div className="org">CD &middot; Contracting</div>
        </div>
      </div>

      {/* Tab bar: Chat | Create | Ideate */}
      <div className="tabs">
        <button
          className={'tab ' + (tab === 'chat' ? 'active' : '')}
          onClick={() => setTab('chat')}
        >
          {ICO.chat}
          <span className="lbl">Chat</span>
        </button>
        <button
          className={'tab ' + (tab === 'create' ? 'active' : '')}
          onClick={() => setTab('create')}
        >
          {ICO.plus}
          <span className="lbl">Create</span>
        </button>
        <button
          className={'tab ' + (tab === 'ideate' ? 'active' : '')}
          onClick={() => setTab('ideate')}
        >
          {ICO.ideate}
          <span className="lbl">Ideate</span>
        </button>
      </div>

      {/* ── Chat-mode sidebar (Procura threads) ── */}
      {isChat ? (
        <div className="nav chat-nav">
          <button className="nav-row new-chat-btn" onClick={() => window.location.reload()}>
            <span className="ico new-chat-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <span className="lbl">New chat</span>
          </button>

          <div className="cmd-search-wrap">
            <span className="cmd-search-ico" aria-hidden="true">{ICO.search}</span>
            <input
              className="cmd-search"
              type="search"
              placeholder="Search threads…"
              aria-label="Search threads"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
            />
            {chatQuery && (
              <button
                type="button"
                className="cmd-search-clear"
                onClick={() => setChatQuery('')}
                aria-label="Clear search"
                title="Clear"
              >×</button>
            )}
          </div>

          {pinnedThreads.length > 0 && (
            <>
              <div className="group-h">
                <span className="lbl">Pinned</span>
                <span className="count-pill">{pinnedThreads.length}</span>
              </div>
              {pinnedThreads.map((t) => (
                <ThreadRow
                  key={t.id}
                  thread={t}
                  active={activeId === t.id}
                  isPinned
                  onSelect={onSelect}
                  onTogglePin={togglePin}
                />
              ))}
            </>
          )}

          {recentThreads.length > 0 && (
            <>
              <div className="group-h">
                <span className="lbl">Recent</span>
                <span className="count-pill">{recentThreads.length}</span>
              </div>
              {recentThreads.map((t) => (
                <ThreadRow
                  key={t.id}
                  thread={t}
                  active={activeId === t.id}
                  isPinned={false}
                  onSelect={onSelect}
                  onTogglePin={togglePin}
                />
              ))}
            </>
          )}

          {pinnedThreads.length === 0 && recentThreads.length === 0 && (
            <div className="chat-empty-search">
              <div className="ico-wrap">{ICO.search}</div>
              <div className="t1">No matches</div>
              <div className="t2">Try a contract code, vendor, or keyword.</div>
            </div>
          )}

          <button className="nav-row thread-all" onClick={() => setAllOpen(true)}>
            <span className="ico">{ICO.clock}</span>
            <span className="lbl">View all conversations</span>
          </button>
        </div>
      ) : (
      <div className="nav">
        <button className="nav-row" onClick={() => navigate('/pa-draft')}>
          <span className="ico">{ICO.doc}</span>
          <span className="lbl">New PA Draft</span>
        </button>

        {/* ---- Workflow ---- */}
        <div className="group-h divided"><span className="lbl">Workflow</span></div>

        <button
          className={'nav-row primary ' + (activeNav === 'overview' ? 'active' : '')}
          onClick={() => navigate(WORKFLOW_ROUTES.overview)}
        >
          <span className="ico">{ICO.stats || ICO.sparkle}</span>
          <span className="lbl">Overview</span>
        </button>

        <button
          className={'nav-row ' + (activeNav === 'inbox' ? 'active' : '')}
          onClick={() => navigate(WORKFLOW_ROUTES.inbox)}
        >
          <span className="ico">{ICO.inbox}</span>
          <span className="lbl">Inbox</span>
          <span className="badge crit">4</span>
        </button>

        <button
          className={'nav-row ' + (activeNav === 'reviews' ? 'active' : '')}
          onClick={() => navigate(WORKFLOW_ROUTES.reviews)}
        >
          <span className="ico">{ICO.review}</span>
          <span className="lbl">Reviews</span>
          <span className="badge warn">3</span>
        </button>

        <button
          className={'nav-row ' + (activeNav === 'bidding' ? 'active' : '')}
          onClick={() => navigate(WORKFLOW_ROUTES.bidding)}
        >
          <span className="ico">{ICO.layers}</span>
          <span className="lbl">Bidding</span>
          <span className="badge">5</span>
        </button>

        <button
          className={'nav-row ' + (activeNav === 'awards' ? 'active' : '')}
          onClick={() => navigate(WORKFLOW_ROUTES.awards)}
        >
          <span className="ico">{ICO.award}</span>
          <span className="lbl">Awards &amp; Sign</span>
          <span className="badge">1</span>
        </button>

        {/* ---- Library ---- */}
        <div className="group-h divided"><span className="lbl">Library</span></div>

        <button
          className={'nav-row' + (activeLib === 'templates' ? ' active' : '')}
          onClick={() => navigate(LIB_ROUTES.templates)}
        >
          <span className="ico">{ICO.template}</span>
          <span className="lbl">Templates</span>
        </button>

        <button
          className={'nav-row' + (activeLib === 'vendors' ? ' active' : '')}
          onClick={() => navigate(LIB_ROUTES.vendors)}
        >
          <span className="ico">{ICO.users}</span>
          <span className="lbl">Vendors &amp; Bidders</span>
        </button>

        <button
          className={'nav-row' + (activeLib === 'clauses' ? ' active' : '')}
          onClick={() => navigate(LIB_ROUTES.clauses)}
        >
          <span className="ico">{ICO.clauses}</span>
          <span className="lbl">Clauses</span>
        </button>

        {/* ---- Insights ---- */}
        <div className="group-h divided"><span className="lbl">Insights</span></div>

        <button
          className={'nav-row' + (activeLib === 'insights' ? ' active' : '')}
          onClick={() => navigate(LIB_ROUTES.insights)}
        >
          <span className="ico">{ICO.sparkle}</span>
          <span className="lbl">Procura insights</span>
          <span className="badge crit">4</span>
        </button>

        <button
          className={'nav-row' + (activeLib === 'activity' ? ' active' : '')}
          onClick={() => navigate(LIB_ROUTES.activity)}
        >
          <span className="ico">{ICO.clock}</span>
          <span className="lbl">Activity log</span>
        </button>

        {/* ---- System ---- */}
        <div className="group-h divided"><span className="lbl">System</span></div>

        <button className="nav-row">
          <span className="ico">{ICO.settings}</span>
          <span className="lbl">Settings</span>
        </button>

        <button className="nav-row">
          <span className="ico">{ICO.help}</span>
          <span className="lbl">Help &amp; shortcuts</span>
        </button>
      </div>
      )}

      {/* ---- Contract list (scrollable) — hidden in chat mode ---- */}
      {!isChat && (
      <div className="list">
        {/* Pinned */}
        {PINNED_CONTRACTS.length > 0 && (
          <>
            <div className="group-h">
              <span>Pinned</span>
              <span className="chev">{ICO.chevD}</span>
            </div>
            {PINNED_CONTRACTS.map(c => (
              <button
                key={c.id}
                className={'chat-row ' + (activeId === c.id ? 'active' : '')}
                onClick={() => { onSelect(c.id); navigate(c.link || '/contract/' + c.id); }}
              >
                <span className="title">{c.title}</span>
              </button>
            ))}
          </>
        )}

        {/* In Bidding */}
        {BIDDING_CONTRACTS.length > 0 && (
          <>
            <div className="group-h">
              <span>In Bidding</span>
              <span className="chev">{ICO.chevD}</span>
            </div>
            {BIDDING_CONTRACTS.map(c => (
              <button
                key={c.id}
                className={'chat-row ' + (activeId === c.id ? 'active' : '')}
                onClick={() => { onSelect(c.id); navigate(c.link || '/contract/' + c.id); }}
              >
                <span className="title">{c.title}</span>
              </button>
            ))}
          </>
        )}

        {/* Recent */}
        {RECENT_CONTRACTS.length > 0 && (
          <>
            <div className="group-h">
              <span>Recent</span>
              <span className="chev">{ICO.chevD}</span>
            </div>
            {RECENT_CONTRACTS.map(c => (
              <button
                key={c.id}
                className={'chat-row ' + (activeId === c.id ? 'active' : '')}
                onClick={() => { onSelect(c.id); navigate(c.link || '/contract/' + c.id); }}
              >
                <span className="title">{c.title}</span>
              </button>
            ))}
          </>
        )}
      </div>
      )}

      {/* ---- User footer ---- */}
      <div className="me">
        <div className="av">MG</div>
        <div className="info">
          <div className="nm">Mohammed Al-Ghamdi</div>
          <div className="em">Contract Representative &middot; CD-PSCM</div>
        </div>
      </div>

      {/* ---- All-conversations modal (chat mode only) ---- */}
      {isChat && allOpen && (
        <ChatAllModal
          threads={CHAT_THREADS}
          pinnedIds={pinnedIds}
          onTogglePin={togglePin}
          onSelect={(id) => { onSelect(id); setAllOpen(false); }}
          onClose={() => setAllOpen(false)}
        />
      )}
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────
   ThreadRow — rich row with category strip, unread badge, pin toggle
   ────────────────────────────────────────────────────────────────── */
function ThreadRow({ thread, active, isPinned, onSelect, onTogglePin }) {
  const cat = CHAT_CAT[thread.cat] || {};
  return (
    <div
      className={'thread-row ' + (active ? 'active ' : '') + (isPinned ? 'is-pinned ' : '')}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(thread.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(thread.id);
        }
      }}
      style={{ '--cat-color': cat.color || 'var(--aramco-blue)' }}
      title={`${thread.title} — ${thread.snippet}`}
    >
      <span className="thread-strip" aria-hidden="true"></span>
      <span className="thread-cat" title={cat.label}>
        <span className="thread-cat-dot"></span>
        {cat.label}
      </span>
      <span className="thread-body">
        <span className="thread-title" title={thread.title}>{thread.title}</span>
        <span className="thread-snippet" title={thread.snippet}>{thread.snippet}</span>
      </span>
      <span className="thread-meta">
        {thread.unread > 0 && <span className="thread-unread" title={`${thread.unread} unread`}>{thread.unread}</span>}
        <span className="thread-time" title={thread.time}>{thread.time}</span>
        <button
          type="button"
          className={'thread-pin-btn ' + (isPinned ? 'on' : '')}
          title={isPinned ? 'Unpin' : 'Pin'}
          aria-label={isPinned ? 'Unpin thread' : 'Pin thread'}
          aria-pressed={isPinned}
          onClick={(e) => { e.stopPropagation(); onTogglePin(thread.id); }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 17v5" />
            <path d="M9 10.76V6a3 3 0 0 1 6 0v4.76l3 4.24H6z" />
          </svg>
        </button>
      </span>
    </div>
  );
}
