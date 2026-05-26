import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { ACTIVITY_LOG } from '../data/constants';

const KIND_META = {
  draft:      { icon: 'doc',    color: 'var(--aramco-dark-blue)' },
  review:     { icon: 'review', color: '#00867B' },
  rfp:        { icon: 'paper',  color: '#643278' },
  evaluation: { icon: 'stats',  color: '#0072A8' },
  award:      { icon: 'award',  color: '#00843D' },
  insight:    { icon: 'sparkle', color: '#C99504' },
};

export default function ActivityLog() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return ACTIVITY_LOG.filter((a) => {
      if (filter !== 'all' && a.kind !== filter) return false;
      if (query && !`${a.actor} ${a.action} ${a.object} ${a.context}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  const tabs = [
    { id: 'all',        label: 'All',        count: ACTIVITY_LOG.length },
    { id: 'draft',      label: 'Drafts',     count: ACTIVITY_LOG.filter((a) => a.kind === 'draft').length },
    { id: 'review',     label: 'Reviews',    count: ACTIVITY_LOG.filter((a) => a.kind === 'review').length },
    { id: 'evaluation', label: 'Evaluations',count: ACTIVITY_LOG.filter((a) => a.kind === 'evaluation').length },
    { id: 'award',      label: 'Awards',     count: ACTIVITY_LOG.filter((a) => a.kind === 'award').length },
    { id: 'insight',    label: 'Insights',   count: ACTIVITY_LOG.filter((a) => a.kind === 'insight').length },
  ];

  // group by relative date bucket (Today / Yesterday / This week / Earlier)
  const buckets = useMemo(() => {
    const out = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };
    filtered.forEach((a) => {
      if (a.when.startsWith('Today')) out.Today.push(a);
      else if (a.when.startsWith('Yesterday')) out.Yesterday.push(a);
      else if (a.when.match(/^[0-6] days ago/)) out['This week'].push(a);
      else out.Earlier.push(a);
    });
    return out;
  }, [filtered]);

  return (
    <div className="page">
      <div className="wrap">
        <div className="lib-head">
          <div className="lib-head-l">
            <div className="lib-eyebrow">Insights</div>
            <h1 className="lib-title">Activity log</h1>
            <div className="lib-sub">Everything you and Procura have done across PRs. Last 30 days. Click any entry to jump to the PA.</div>
          </div>
          <div className="lib-head-r">
            <div className="lib-search">
              <span className="lib-search-ic">{ICO.search}</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activity…" aria-label="Search activity" />
            </div>
          </div>
        </div>

        <div className="lib-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={'lib-tab ' + (filter === t.id ? 'is-active' : '')}
              onClick={() => setFilter(t.id)}
              role="tab"
              aria-selected={filter === t.id}
            >
              {t.label} <span className="lib-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="act-buckets">
          {Object.entries(buckets).map(([bucket, items]) => items.length > 0 && (
            <div key={bucket} className="act-bucket">
              <div className="act-bucket-h">{bucket} <span className="chip-pill xs is-neutral">{items.length}</span></div>
              <div className="act-stack">
                {items.map((a) => {
                  const k = KIND_META[a.kind] || KIND_META.draft;
                  const Ico = ICO[k.icon] || ICO.doc;
                  return (
                    <button key={a.id} className="act-row" onClick={() => navigate(a.link)}>
                      <div className="act-ic" style={{ color: k.color, background: `color-mix(in srgb, ${k.color} 8%, transparent)` }}>{Ico}</div>
                      <div className="act-body">
                        <div className="act-line"><b>{a.actor}</b> {a.action} <span className="act-object">{a.object}</span></div>
                        <div className="act-meta">{a.context}{a.pa !== '—' && <> · <span className="act-pa">{a.pa}</span></>}</div>
                      </div>
                      <div className="act-when">{a.when}</div>
                      <div className="act-go">{ICO.chevR}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="lib-empty">No activity matches the current filter.</div>}
        </div>
      </div>
    </div>
  );
}
