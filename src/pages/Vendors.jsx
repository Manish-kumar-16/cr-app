import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { VENDORS_DATA } from '../data/constants';
import { Toast, makeToaster } from '../components/WizardKit';

const TIER_TONE = {
  preferred: 'is-ok',
  active:    'is-neutral',
  watchlist: 'is-warn',
};

const TIER_LABEL = { preferred: 'Preferred', active: 'Active', watchlist: 'Watchlist' };

function rating(score) {
  // visual 5-bar
  const filled = Math.round(score);
  return (
    <span className="vr-bars" aria-label={`${score} of 5`}>
      {[1,2,3,4,5].map((i) => <span key={i} className={'vr-bar ' + (i <= filled ? 'on' : '')} />)}
      <span className="vr-num">{score.toFixed(1)}</span>
    </span>
  );
}

export default function Vendors() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);
  const showToast = makeToaster(setToast);

  const filtered = useMemo(() => {
    return VENDORS_DATA.filter((v) => {
      if (filter !== 'all' && v.tier !== filter) return false;
      if (query && !`${v.name} ${v.code} ${v.country}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, query]);

  const tabs = [
    { id: 'all',       label: 'All',       count: VENDORS_DATA.length },
    { id: 'preferred', label: 'Preferred', count: VENDORS_DATA.filter((v) => v.tier === 'preferred').length },
    { id: 'active',    label: 'Active',    count: VENDORS_DATA.filter((v) => v.tier === 'active').length },
    { id: 'watchlist', label: 'Watchlist', count: VENDORS_DATA.filter((v) => v.tier === 'watchlist').length },
  ];

  return (
    <div className="page">
      <div className="wrap">
        <div className="lib-head">
          <div className="lib-head-l">
            <div className="lib-eyebrow">Library</div>
            <h1 className="lib-title">Vendors &amp; Bidders</h1>
            <div className="lib-sub">{VENDORS_DATA.length} vendors · IKTVA, performance, ownership status. Click a vendor to see their bid history and qualifications.</div>
          </div>
          <div className="lib-head-r">
            <div className="lib-search">
              <span className="lib-search-ic">{ICO.search}</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search vendors…"
                aria-label="Search vendors"
              />
            </div>
            <button className="pbtn" onClick={() => showToast('Vendor list exported.')}><span>{ICO.download}</span>Export</button>
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

        <div className="panel">
          <table className="vendors-tbl">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Country</th>
                <th>Ownership</th>
                <th className="num">IKTVA</th>
                <th>Performance</th>
                <th className="num">Active</th>
                <th>Last contract</th>
                <th>Tier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="vt-name">{v.name}</div>
                    {v.notes && <div className="vt-notes">{v.notes}</div>}
                  </td>
                  <td className="vt-country">{v.country}</td>
                  <td><span className={'vt-own ' + (v.ownership === 'In-Kingdom' ? 'ik' : v.ownership === 'JV' ? 'jv' : 'ook')}>{v.ownership}</span></td>
                  <td className="num">
                    <span className={'vt-iktva ' + (v.iktva >= 65 ? 'ok' : 'warn')}>{v.iktva}%</span>
                  </td>
                  <td>{rating(v.performance)}</td>
                  <td className="num"><span className="vt-active">{v.activeContracts}</span></td>
                  <td className="vt-when">{v.lastContract}</td>
                  <td><span className={'chip-pill xs ' + TIER_TONE[v.tier]}>{TIER_LABEL[v.tier]}</span></td>
                  <td>
                    <button className="row-link-btn" onClick={() => { showToast(`Opening ${v.name}…`); setTimeout(() => navigate('/bid-evaluation'), 300); }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="lib-empty">No vendors match the current filter.</div>}
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
