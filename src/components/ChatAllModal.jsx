import { useEffect, useMemo, useState } from 'react';
import { ICO } from './Icons';
import { CHAT_CAT } from '../data/constants';

const FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'pa',    label: 'PA' },
  { id: 'bid',   label: 'Bid' },
  { id: 'award', label: 'Award' },
  { id: 'iktva', label: 'IKTVA' },
  { id: 'src',   label: 'SRC' },
];

const SECTION_BUCKETS = [
  { key: 'today',     label: 'Today',         min: -86400 },
  { key: 'yesterday', label: 'Yesterday',     min: -2 * 86400 },
  { key: 'week',      label: 'Earlier this week', min: -7 * 86400 },
  { key: 'older',     label: 'Older',         min: -Infinity },
];

function bucketOf(ts) {
  for (const b of SECTION_BUCKETS) {
    if (ts >= b.min) return b.key;
  }
  return 'older';
}

export default function ChatAllModal({ threads, pinnedIds, onTogglePin, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (filter !== 'all' && t.cat !== filter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.snippet.toLowerCase().includes(q) ||
        (CHAT_CAT[t.cat]?.label || '').toLowerCase().includes(q)
      );
    });
  }, [threads, query, filter]);

  const grouped = useMemo(() => {
    const map = { pinned: [], today: [], yesterday: [], week: [], older: [] };
    filtered.forEach((t) => {
      if (pinnedIds.has(t.id)) map.pinned.push(t);
      else map[bucketOf(t.ts)].push(t);
    });
    return map;
  }, [filtered, pinnedIds]);

  const sections = [
    { key: 'pinned',    label: 'Pinned',           rows: grouped.pinned    },
    { key: 'today',     label: 'Today',            rows: grouped.today     },
    { key: 'yesterday', label: 'Yesterday',        rows: grouped.yesterday },
    { key: 'week',      label: 'Earlier this week',rows: grouped.week      },
    { key: 'older',     label: 'Older',            rows: grouped.older     },
  ].filter((s) => s.rows.length > 0);

  return (
    <div className="all-modal-scrim" role="dialog" aria-modal="true" aria-label="All conversations" onClick={onClose}>
      <div className="all-modal" onClick={(e) => e.stopPropagation()}>
        <div className="all-modal-head">
          <div className="all-modal-title">
            <span className="all-modal-eyebrow">Procura · All conversations</span>
            <h2>Your Procura thread history</h2>
            <p className="all-modal-sub">
              {threads.length} conversations · last 14 days · CD-PSCM workspace
            </p>
          </div>
          <button type="button" className="all-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="all-modal-toolbar">
          <label className="all-search">
            <span className="all-search-ico" aria-hidden="true">{ICO.search}</span>
            <input
              type="search"
              placeholder="Search conversations, contracts, vendors…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </label>

          <div className="all-filters" role="tablist" aria-label="Filter by category">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={'all-filter ' + (filter === f.id ? 'active' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {f.id !== 'all' && CHAT_CAT[f.id] && (
                  <span className="all-filter-dot" style={{ background: CHAT_CAT[f.id].color }}></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="all-modal-body">
          {sections.length === 0 && (
            <div className="all-empty">
              <div className="all-empty-ico">{ICO.search}</div>
              <div className="all-empty-t1">No conversations match</div>
              <div className="all-empty-t2">Try a different keyword or clear the filter.</div>
            </div>
          )}
          {sections.map((s) => (
            <div className="all-section" key={s.key}>
              <div className="all-section-h">
                <span>{s.label}</span>
                <span className="all-section-count">{s.rows.length}</span>
              </div>
              <ul className="all-list">
                {s.rows.map((t) => {
                  const cat = CHAT_CAT[t.cat] || {};
                  const isPinned = pinnedIds.has(t.id);
                  return (
                    <li
                      key={t.id}
                      className="all-row"
                      style={{ '--cat-color': cat.color }}
                      role="button"
                      tabIndex={0}
                      title={`${t.title} — ${t.snippet}`}
                      onClick={() => onSelect(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(t.id);
                        }
                      }}
                    >
                      <span className="all-row-cat" title={cat.label}>
                        <span className="all-row-cat-dot"></span>
                        {cat.label}
                      </span>
                      <div className="all-row-body">
                        <div className="all-row-title" title={t.title}>{t.title}</div>
                        <div className="all-row-snippet" title={t.snippet}>{t.snippet}</div>
                      </div>
                      <div className="all-row-meta">
                        {t.unread > 0 && <span className="all-row-unread">{t.unread} new</span>}
                        <span className="all-row-time">{t.time}</span>
                        <button
                          type="button"
                          className={'all-row-pin ' + (isPinned ? 'on' : '')}
                          title={isPinned ? 'Unpin' : 'Pin'}
                          aria-label={isPinned ? 'Unpin thread' : 'Pin thread'}
                          onClick={(e) => { e.stopPropagation(); onTogglePin(t.id); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 17v5" />
                            <path d="M9 10.76V6a3 3 0 0 1 6 0v4.76l3 4.24H6z" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
