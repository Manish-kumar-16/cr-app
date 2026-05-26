import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { INSIGHTS_DATA } from '../data/constants';
import { Toast, makeToaster } from '../components/WizardKit';

const PRIORITY_TONE = {
  high:   { bg: 'color-mix(in srgb, #C44A2D 8%, transparent)', border: '#C44A2D', label: 'High' },
  medium: { bg: 'color-mix(in srgb, #C99504 8%, transparent)', border: '#C99504', label: 'Medium' },
  low:    { bg: 'var(--bg-surface)',                            border: 'var(--hair)', label: 'Low' },
};

export default function Insights() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INSIGHTS_DATA);
  const [toast, setToast] = useState(null);
  const showToast = makeToaster(setToast);

  const newItems = items.filter((i) => i.state === 'new');
  const actedItems = items.filter((i) => i.state === 'acted');
  const dismissedItems = items.filter((i) => i.state === 'dismissed');

  const setState = (id, state, msg) => {
    setItems((p) => p.map((x) => x.id === id ? { ...x, state } : x));
    if (msg) showToast(msg);
  };

  const renderCard = (i) => {
    const tone = PRIORITY_TONE[i.priority];
    const Ico = ICO[i.icon] || ICO.sparkle;
    return (
      <div key={i.id} className={`ins-card ins-${i.state}`} style={{ background: tone.bg, borderColor: tone.border }}>
        <div className="ins-card-head">
          <div className="ins-ic" style={{ color: tone.border }}>{Ico}</div>
          <div className="ins-headline">
            <div className="ins-priority"><span className="ins-pdot" style={{ background: tone.border }} />{tone.label} priority</div>
            <h3 className="ins-title">{i.title}</h3>
          </div>
          <div className="ins-meta">
            <span className="ins-conf" title="Procura confidence">{i.confidence}%</span>
            <span className="ins-age">· {i.age}</span>
          </div>
        </div>
        <div className="ins-body">
          <div className="ins-evidence"><b>Evidence ·</b> {i.evidence}</div>
          <div className="ins-value"><b>Why it matters ·</b> {i.value}</div>
          <div className="ins-tags">
            {i.tags.map((t) => <span key={t} className="ins-tag">{t}</span>)}
          </div>
        </div>
        <div className="ins-actions">
          {i.state === 'new' && (
            <>
              <button className="pbtn xs primary" onClick={() => { setState(i.id, 'acted', 'Marked as acted.'); setTimeout(() => navigate(i.actionLink), 300); }}>{i.action}</button>
              <button className="row-link-btn" onClick={() => setState(i.id, 'dismissed', 'Dismissed.')}>Dismiss</button>
            </>
          )}
          {i.state === 'acted' && (
            <>
              <span className="ins-acted-chip"><span className="ins-acted-tick">✓</span> Acted</span>
              <button className="row-link-btn" onClick={() => setState(i.id, 'new', 'Re-opened.')}>Reopen</button>
            </>
          )}
          {i.state === 'dismissed' && (
            <button className="row-link-btn" onClick={() => setState(i.id, 'new', 'Restored.')}>Restore</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="wrap">
        <div className="lib-head">
          <div className="lib-head-l">
            <div className="lib-eyebrow"><span className="ins-eyebrow-dot" />Procura</div>
            <h1 className="lib-title">Insights</h1>
            <div className="lib-sub">Procura watches your pipeline 24/7 and surfaces what needs attention. {newItems.length} new today.</div>
          </div>
          <div className="lib-head-r">
            <div className="ins-summary-cluster">
              <div className="ins-sum">
                <div className="ins-sum-val">{newItems.length}</div>
                <div className="ins-sum-lbl">New</div>
              </div>
              <div className="ins-sum">
                <div className="ins-sum-val">{actedItems.length}</div>
                <div className="ins-sum-lbl">Acted</div>
              </div>
              <div className="ins-sum">
                <div className="ins-sum-val">{dismissedItems.length}</div>
                <div className="ins-sum-lbl">Dismissed</div>
              </div>
            </div>
          </div>
        </div>

        {newItems.length > 0 && (
          <>
            <div className="ins-group-h">
              <span>New</span>
              <span className="chip-pill xs is-warn">{newItems.length}</span>
            </div>
            <div className="ins-stack">{newItems.map(renderCard)}</div>
          </>
        )}

        {actedItems.length > 0 && (
          <details open className="ins-group">
            <summary className="ins-group-h">
              <span className="ins-chev">{ICO.chevR}</span>
              <span>Acted on</span>
              <span className="chip-pill xs is-ok">{actedItems.length}</span>
            </summary>
            <div className="ins-stack">{actedItems.map(renderCard)}</div>
          </details>
        )}

        {dismissedItems.length > 0 && (
          <details className="ins-group">
            <summary className="ins-group-h">
              <span className="ins-chev">{ICO.chevR}</span>
              <span>Dismissed</span>
              <span className="chip-pill xs is-neutral">{dismissedItems.length}</span>
            </summary>
            <div className="ins-stack">{dismissedItems.map(renderCard)}</div>
          </details>
        )}
      </div>
      <Toast toast={toast} />
    </div>
  );
}
