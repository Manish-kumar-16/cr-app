import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import { CHIPS } from '../data/constants';
import '../styles/chat.css';

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const taRef = useRef(null);
  const threadRef = useRef(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    const t = setTimeout(() => taRef.current?.focus({ preventScroll: true }), 240);
    return () => clearTimeout(t);
  }, []);

  const send = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply = {
        id: `p-${Date.now()}`,
        role: 'procura',
        text:
          'Looking into that against the CD-PSCM context now — I\'ll pull the relevant PA template, IKTVA history, and CE +5% rule references. (Mockup reply.)',
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 1400);
  };

  const applyChip = (chip) => {
    if (chip.route) {
      navigate(chip.route);
      return;
    }
    setInput(chip.label + ' — ');
    setTimeout(() => taRef.current?.focus(), 30);
  };

  const isEmpty = messages.length === 0 && !thinking;

  return (
    <div className="chat-stage">
      <div ref={threadRef} className="chat-thread">
        {isEmpty ? (
          <div className="chat-empty">
            <div className="greet-block">
              <div className="greet-eyebrow">
                <span className="bar"></span>
                Procura · CR Workspace
              </div>
              <h1 className="greet">
                {greeting}, <span className="grad">Mohammed</span>
              </h1>
              <p className="greet-sub">
                You have <b>3 drafts</b> pending review and <b>2 approvals</b> awaiting action.
              </p>
            </div>

            <div className="chat-chips">
              {CHIPS.map((c) => (
                <button
                  key={c.id}
                  className={`chat-chip ${c.acc}`}
                  onClick={() => applyChip(c)}
                >
                  <span className="chip-ico">{ICO[c.ico]}</span>
                  <span className="chip-text">
                    <span className="chip-label">{c.label}</span>
                    {c.desc && <span className="chip-desc">{c.desc}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="chat-msgs">
            {messages.map((m) => (
              <li key={m.id} className={`msg msg-${m.role}`}>
                {m.role === 'procura' && (
                  <span className="msg-avatar" aria-hidden="true">
                    {ICO.sparkle}
                  </span>
                )}
                <div className="msg-bubble">{m.text}</div>
              </li>
            ))}
            {thinking && (
              <li className="msg msg-procura">
                <span className="msg-avatar" aria-hidden="true">{ICO.sparkle}</span>
                <div className="msg-bubble msg-typing" aria-label="Procura is thinking">
                  <span className="t-dot"></span>
                  <span className="t-dot"></span>
                  <span className="t-dot"></span>
                </div>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="chat-dock">
        <div className="composer-wrap">
          <div className="composer-glow" aria-hidden="true"></div>
          <div className="composer">
            <textarea
              ref={taRef}
              placeholder="Message Procura — contracts, PAs, bids, IKTVA…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
            />
            <div className="row">
              <button className="ibtn" type="button" title="Attach file">{ICO.attach}</button>
              <button className="ibtn" type="button" title="Voice input">{ICO.mic}</button>
              <span className="spacer"></span>
              <button className="model" type="button" title="Switch model">
                <span className="model-glyph">{ICO.sparkle}</span>
                <span className="model-name">Metabrain</span>
                <span className="model-chev">{ICO.chevD}</span>
              </button>
              <button
                className="send"
                type="button"
                onClick={() => send()}
                disabled={!input.trim()}
                title="Send"
              >
                {ICO.send}
              </button>
            </div>
          </div>
          <div className="chat-stage-foot">
            <b>Procura</b> is an AI assistant. Verify outputs against the Procurement Manual before submission.
          </div>
        </div>
      </div>
    </div>
  );
}
