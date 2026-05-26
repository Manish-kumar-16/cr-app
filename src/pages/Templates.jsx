import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { TEMPLATES_DATA } from '../data/constants';
import { Toast, makeToaster } from '../components/WizardKit';

const CATEGORY_TONE = {
  PA:        { bg: 'color-mix(in srgb, var(--aramco-dark-blue) 10%, transparent)', fg: 'var(--aramco-dark-blue)' },
  Award:     { bg: 'color-mix(in srgb, #00843D 12%, transparent)',                  fg: '#00843D' },
  Memo:      { bg: 'color-mix(in srgb, #C99504 14%, transparent)',                  fg: '#8E6A00' },
  Schedule:  { bg: 'color-mix(in srgb, var(--accent-deep-teal) 12%, transparent)',  fg: '#00867B' },
  RFP:       { bg: 'color-mix(in srgb, #643278 12%, transparent)',                  fg: '#643278' },
};

export default function Templates() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = makeToaster(setToast);

  const filtered = useMemo(() => {
    return TEMPLATES_DATA.filter((t) => {
      if (filter !== 'all' && t.category !== filter) return false;
      if (query && !`${t.name} ${t.code} ${t.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  const tabs = [
    { id: 'all',      label: 'All', count: TEMPLATES_DATA.length },
    { id: 'PA',       label: 'PA', count: TEMPLATES_DATA.filter((t) => t.category === 'PA').length },
    { id: 'Schedule', label: 'Schedules', count: TEMPLATES_DATA.filter((t) => t.category === 'Schedule').length },
    { id: 'Award',    label: 'Award', count: TEMPLATES_DATA.filter((t) => t.category === 'Award').length },
    { id: 'Memo',     label: 'Memos', count: TEMPLATES_DATA.filter((t) => t.category === 'Memo').length },
    { id: 'RFP',      label: 'RFP', count: TEMPLATES_DATA.filter((t) => t.category === 'RFP').length },
  ];

  return (
    <div className="page">
      <div className="wrap">
        <div className="lib-head">
          <div className="lib-head-l">
            <div className="lib-eyebrow">Library</div>
            <h1 className="lib-title">Templates</h1>
            <div className="lib-sub">PA, schedule, award, memo and RFP templates — versioned, owned by source teams.</div>
          </div>
          <div className="lib-head-r">
            <div className="lib-search">
              <span className="lib-search-ic">{ICO.search}</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                aria-label="Search templates"
              />
            </div>
            <button className="pbtn" onClick={() => showToast('Export started — pack ready in 1m.')}><span>{ICO.download}</span>Export pack</button>
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

        <div className="tpl-grid">
          {filtered.map((t) => {
            const tone = CATEGORY_TONE[t.category] || CATEGORY_TONE.PA;
            return (
              <div key={t.id} className="tpl-card">
                <div className="tpl-card-head">
                  <span className="tpl-cat" style={{ background: tone.bg, color: tone.fg }}>{t.category}</span>
                  {t.mandatory && <span className="tpl-mandatory">Required</span>}
                  <span className="tpl-usage" title="Times used in last 90 days">{t.usage}× used</span>
                </div>
                <div className="tpl-code">{t.code}</div>
                <h3 className="tpl-name">{t.name}</h3>
                <p className="tpl-desc">{t.description}</p>
                <div className="tpl-meta">
                  <span>Owner · {t.owner}</span>
                  <span>· Updated {t.lastUpdated}</span>
                </div>
                {t.schedules.length > 0 && (
                  <div className="tpl-schedules">
                    {t.schedules.map((s) => <span key={s} className="tpl-sched-chip">Sch {s}</span>)}
                  </div>
                )}
                <div className="tpl-actions">
                  <button className="pbtn xs" onClick={() => showToast(`Previewing ${t.code}…`)}>{ICO.doc}<span>Preview</span></button>
                  <button className="pbtn xs primary" onClick={() => { showToast(`Using ${t.code} in PA Draft.`); setTimeout(() => navigate('/pa-draft'), 400); }}>Use template</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="lib-empty">No templates match the current filter.</div>
          )}
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
