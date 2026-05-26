import { ICO } from './Icons';

/* PA identity hero — mirrors PA Draft's pr-banner across every transactional screen.
   currentStage is 1-indexed into the 7-stage CR lifecycle:
   1 Intake · 2 PA Draft · 3 Functional Review · 4 Bid Slate · 5 Bidding · 6 Evaluation · 7 Award */
export function PaHero({
  pa, title, value, track,
  proponent, dept, notes,
  currentStage, totalStages = 7, stageLabel, slaLeft,
  onViewPa, onViewPrs,
  onOpenPaDraft,            // primary: navigate to /pa-draft wizard
  onViewPaDraftSnapshot,    // secondary: read-only summary modal
  onViewPaDraft,            // legacy alias — kept for older callers
}) {
  const openPaDraft = onOpenPaDraft || onViewPaDraft;
  const snapshot = onViewPaDraftSnapshot;
  return (
    <div className="pr-banner">
      <div className="pr-banner-l">
        <div className="pr-banner-title">
          <span className="pr-banner-code">{pa}</span>
          <span className="pr-banner-name">{title}</span>
        </div>
        <div className="pr-banner-meta">
          <span><b>{value}</b>{track ? ` · ${track}` : ''}</span>
          {proponent && (<><span className="sep">·</span><span>Proponent: <b>{proponent}</b>{dept ? ` (${dept})` : ''}</span></>)}
          {notes && (<><span className="sep">·</span><span>{notes}</span></>)}
        </div>
      </div>
      <div className="pr-banner-r">
        <div className="pr-status">
          <div className="pr-status-head">
            <span className="status-chip pr-status-chip stage-active">{stageLabel}</span>
            <span className="pr-stage-count">Stage <b>{currentStage}</b>/{totalStages}</span>
          </div>
          <div className="pr-status-progress">
            <span className="pr-stage-bar" aria-label={`Stage ${currentStage} of ${totalStages}`}>
              {Array.from({ length: totalStages }).map((_, i) => {
                const idx = i + 1;
                const k = idx < currentStage ? 'is-done' : idx === currentStage ? 'is-active' : '';
                return <span key={i} className={'seg ' + k} />;
              })}
            </span>
            {slaLeft && <span className="pr-status-left">{slaLeft}</span>}
          </div>
        </div>
        <div className="pr-banner-actions">
          {onViewPa && <button className="pbtn xs" title="View the released PA document" onClick={onViewPa}>{ICO.eye}<span>View PA</span></button>}
          {openPaDraft && (
            <button
              className="pbtn xs"
              title="Open the PA Draft wizard — revisit / re-edit any of the 5 steps"
              onClick={openPaDraft}
            >{ICO.doc}<span>Open PA Draft</span></button>
          )}
          {snapshot && (
            <button
              className="pbtn xs ghost"
              title="Read-only summary of PA Draft decisions (no edit)"
              onClick={snapshot}
              aria-label="View PA Draft summary"
            >{ICO.info}</button>
          )}
          {onViewPrs && <button className="pbtn xs" title="View PR Strategy doc" onClick={onViewPrs}>{ICO.paper}<span>PRS</span></button>}
        </div>
      </div>
    </div>
  );
}

/* AI chip — `Procura · <verb> Xs ago` (canonical PA Draft pattern). */
export function AiChip({ verb = 'analysed', ago = '2s', title }) {
  // "just now" / "now" are already complete relative timestamps — don't append " ago"
  const isInstant = /^(just\s+)?now$/i.test(ago);
  return (
    <span className="ai-chip" title={title || `Procura ${verb} this section`}>
      <span className="ai-chip-dot"></span>
      Procura · {verb} {ago}{isInstant ? '' : ' ago'}
    </span>
  );
}

/* Info icon (standalone, controlled hover/click tooltip). */
export function InfoIcon({ openKey, currentOpen, onToggle, children, label = 'How this works' }) {
  return (
    <button
      type="button"
      className="info-btn standalone"
      onClick={() => onToggle(currentOpen === openKey ? null : openKey)}
      onMouseEnter={() => onToggle(openKey)}
      onMouseLeave={() => onToggle(null)}
      aria-label={label}
    >
      {ICO.info} <span>{label}</span>
      {currentOpen === openKey && <span className="info-pop" role="tooltip">{children}</span>}
    </button>
  );
}

/* CR action callout. */
export function CrAction({ children }) {
  return <p className="cr-action">{children}</p>;
}

/* Confirm modal (matches PADraft markup: doc-modal overlay + confirm-panel). */
export function ConfirmModal({ confirm, onClose }) {
  if (!confirm) return null;
  return (
    <div className="doc-modal" onClick={onClose}>
      <div
        className={'confirm-panel ' + (confirm.tone === 'warn' ? 'is-warn' : '')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-ic">{confirm.tone === 'warn' ? '!' : '?'}</div>
        <h3 className="confirm-title">{confirm.title}</h3>
        <p className="confirm-body">{confirm.body}</p>
        <div className="confirm-actions">
          <button className="pbtn" onClick={onClose}>{confirm.cancelLabel || 'Cancel'}</button>
          <button className="pbtn-premium" onClick={confirm.onYes}>
            <span className="pbtn-premium-label">{confirm.confirmLabel || 'Confirm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Toast — bottom-center pill, tone = 'ok' | 'warn' | 'info'. */
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={'toast toast-' + (toast.tone || 'ok')}>
      <span className="toast-dot"></span>
      <span className="toast-msg">{toast.msg}</span>
    </div>
  );
}

/* Evidence (doc) modal — the actual PR/source snippet Procura cited.
   When `doc.actions` is provided (array of {label, tone, onClick, primary}),
   renders an action footer so the CR can DO something about the finding, not
   just read it. Use this for Address / Fix / Hand-back flows. */
export function EvidenceModal({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div className="doc-modal" onClick={onClose}>
      <div className="doc-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-head">
          <div>
            <div className="doc-modal-eyebrow">{doc.eyebrow || 'Source · cited by Procura'}</div>
            <h2>{doc.title}</h2>
            {doc.issuedBy && <div className="doc-issued">{doc.issuedBy}</div>}
          </div>
          <button className="doc-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="doc-modal-body">
          {doc.sections?.map((s, i) => (
            <div key={i} className="doc-sec">
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
          {doc.quote && (
            <div className="doc-sec"><blockquote className="doc-quote">{doc.quote}</blockquote></div>
          )}
        </div>
        {/* Decision cards — radio-card style for clear CR choices */}
        {doc.decisionCards?.length > 0 && (
          <div className="doc-decision">
            <div className="dd-prompt">{doc.decisionPrompt || 'What do you want to do?'}</div>
            <div className="dd-cards">
              {doc.decisionCards.map((c, i) => (
                <button
                  key={i}
                  className={'dd-card tone-' + (c.tone || 'neutral') + (c.recommended ? ' is-recommended' : '')}
                  onClick={c.onClick}
                >
                  <span className={'dd-ic tone-' + (c.tone || 'neutral')}>{c.icon}</span>
                  <span className="dd-body">
                    <span className="dd-title">
                      {c.title}
                      {c.recommended && <span className="dd-rec">Recommended</span>}
                    </span>
                    <span className="dd-sub">{c.sub}</span>
                  </span>
                  <span className="dd-go">{ICO.arrowR}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legacy actions row + foot-note (kept for non-decision-card callers) */}
        {(doc.actions?.length || doc.foot) && (
          <div className="doc-modal-foot">
            {doc.foot && <div className="doc-foot-note">{doc.foot}</div>}
            {doc.actions?.length > 0 && (
              <div className="doc-foot-actions">
                <button className="pbtn ghost" onClick={onClose}>Cancel</button>
                {doc.actions.map((a, i) => (
                  <button
                    key={i}
                    className={
                      a.tone === 'primary' ? 'pbtn-premium'
                      : a.tone === 'warn'  ? 'pbtn warn'
                      : 'pbtn'
                    }
                    onClick={a.onClick}
                  >
                    {a.tone === 'primary'
                      ? <><span className="pbtn-premium-label">{a.label}</span></>
                      : a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cancel-only footer when decisionCards is used */}
        {doc.decisionCards?.length > 0 && (
          <div className="doc-modal-foot dd-foot">
            <button className="pbtn ghost" onClick={onClose}>{ICO.arrowL}<span>Cancel</span></button>
          </div>
        )}

        {/* Resolve bar for view-and-resolve callouts */}
        {doc.onResolve && (
          <div className="doc-resolve-bar">
            <div className="doc-resolve-text">{doc.resolveText || 'Mark this callout as addressed.'}</div>
            <button className="pbtn-premium" onClick={doc.onResolve}>
              <span className="pbtn-premium-label">{doc.resolveLabel || 'Mark resolved'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Helper: returns a showToast(msg, tone, ms) bound to a setToast setter. */
// eslint-disable-next-line react-refresh/only-export-components
export function makeToaster(setToast) {
  return (msg, tone = 'ok', ms = 3500) => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), ms);
  };
}
