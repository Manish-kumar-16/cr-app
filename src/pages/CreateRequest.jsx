import { Link } from 'react-router-dom';

export default function CreateRequest() {
  return (
    <div style={{ padding: '32px clamp(20px, 4vw, 56px)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
          letterSpacing: '-0.022em', color: 'var(--t1)', marginBottom: 6,
        }}>New Service Request</div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--t3)',
          marginBottom: 24,
        }}>Catalog &middot; templates &middot; smart fill</div>
        <div style={{
          padding: 32, borderRadius: 16, background: 'var(--bg-surface)',
          border: '1px solid var(--hair)', color: 'var(--t2)',
        }}>
          Buyer-side request creation &mdash; service catalog, BOQ assembly,
          IKTVA pre-check before submission. Coming next milestone.
          {' '}<Link to="/" style={{ color: 'var(--aramco-blue)' }}>Back to workspace</Link>
        </div>
      </div>
    </div>
  );
}
