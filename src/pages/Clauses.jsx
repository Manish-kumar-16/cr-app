import { useMemo, useState } from 'react';
import { ICO } from '../components/Icons';
import { CLAUSES_DATA } from '../data/constants';
import { Toast, makeToaster } from '../components/WizardKit';

const CATEGORY_TONE = {
  Commercial:  { bg: 'color-mix(in srgb, var(--aramco-dark-blue) 10%, transparent)', fg: 'var(--aramco-dark-blue)' },
  IKTVA:       { bg: 'color-mix(in srgb, var(--accent-deep-teal) 12%, transparent)', fg: '#00867B' },
  Legal:       { bg: 'color-mix(in srgb, #643278 12%, transparent)',                  fg: '#643278' },
  'Schedule B':{ bg: 'color-mix(in srgb, #00843D 12%, transparent)',                  fg: '#00843D' },
  'Schedule C':{ bg: 'color-mix(in srgb, #C99504 14%, transparent)',                  fg: '#8E6A00' },
};

export default function Clauses() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = makeToaster(setToast);

  const filtered = useMemo(() => {
    return CLAUSES_DATA.filter((c) => {
      if (filter !== 'all' && c.category !== filter) return false;
      if (query && !`${c.title} ${c.ref} ${c.summary}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  const cats = Array.from(new Set(CLAUSES_DATA.map((c) => c.category)));
  const tabs = [
    { id: 'all', label: 'All', count: CLAUSES_DATA.length },
    ...cats.map((c) => ({ id: c, label: c, count: CLAUSES_DATA.filter((x) => x.category === c).length })),
  ];

  return (
    <div className="page">
      <div className="wrap">
        <div className="lib-head">
          <div className="lib-head-l">
            <div className="lib-eyebrow">Library</div>
            <h1 className="lib-title">Clauses</h1>
            <div className="lib-sub">{CLAUSES_DATA.length} clauses — owned by source teams, versioned. Used by PA Draft + Bid Slate + Award memos.</div>
          </div>
          <div className="lib-head-r">
            <div className="lib-search">
              <span className="lib-search-ic">{ICO.search}</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clauses…" aria-label="Search clauses" />
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

        <div className="clause-list">
          {filtered.map((c) => {
            const tone = CATEGORY_TONE[c.category] || CATEGORY_TONE.Commercial;
            return (
              <div key={c.id} className="clause-card">
                <div className="cl-head">
                  <span className="cl-ref">{c.ref}</span>
                  <span className="cl-cat" style={{ background: tone.bg, color: tone.fg }}>{c.category}</span>
                  {c.mandatory && <span className="cl-mandatory">Mandatory</span>}
                </div>
                <h3 className="cl-title">{c.title}</h3>
                <p className="cl-summary">{c.summary}</p>
                <div className="cl-meta">
                  <span>Owner · {c.owner}</span>
                  <span>· Reviewed {c.lastReviewed}</span>
                  <span>· Used in {c.usageCount} contracts</span>
                </div>
                <div className="cl-actions">
                  <button className="row-link-btn" onClick={() => showToast(`Opening ${c.ref}…`)}>{ICO.doc} View clause</button>
                  <button className="row-link-btn" onClick={() => showToast('Pinned to your library.')}>{ICO.pin} Pin</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="lib-empty">No clauses match the current filter.</div>}
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
