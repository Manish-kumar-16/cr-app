import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 'inbox',    label: 'Inbox',         to: '/' },
  { id: 'pa',       label: 'PA Draft',      to: '/pa-draft' },
  { id: 'review',   label: 'Functional',    to: '/functional-review' },
  { id: 'slate',    label: 'Bid Slate',     to: '/bid-slate/PA-LFPA-0241' },
  { id: 'evaluate', label: 'Bid Eval',      to: '/bid-evaluation' },
  { id: 'award',    label: 'Award & Sign',  to: '/award-sign' },
  { id: 'contract', label: 'Cockpit',       to: '/contract/PA-LFPA-0218' },
];

export default function FlowStepper({ active }) {
  const navigate = useNavigate();
  const activeIdx = STEPS.findIndex((s) => s.id === active);

  return (
    <nav className="flow-stepper" aria-label="CR processing flow">
      {STEPS.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        return (
          <button
            key={s.id}
            type="button"
            className={`fs-step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
            onClick={() => navigate(s.to)}
            title={s.label}
          >
            <span className="fs-dot">{isDone ? '✓' : i + 1}</span>
            <span className="fs-label">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
