import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICO } from '../components/Icons';
import logoSrc from '../assets/logo-sidebar.png';
import '../styles/login.css';

export default function Login() {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      try { localStorage.setItem('cr-auth', '1'); } catch { /* ignore quota */ }
      setLoading(false);
      navigate('/chat');
    }, 1400);
  };

  const trackMouse = (e) => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    btnRef.current.style.setProperty('--mx', `${x}%`);
  };

  return (
    <div className="login-stage">
      <div className="login-aurora" aria-hidden="true"></div>
      <div className="login-inner">
        {/* LEFT — marketing column */}
        <div className="left">
          <div className="eyebrow">
            <span className="bar"></span>
            CONTRACT REPRESENTATIVE WORKSPACE
          </div>

          <div className="brand">
            <img src={logoSrc} alt="iProcurement" className="brand-logo" />
            <div className="name">
              <div className="product">Aramco iProcurement</div>
              <div className="org">CD &middot; PSCM</div>
            </div>
          </div>

          <h1 className="headline">
            From PR to award,<br/>
            <span className="grad">intelligently faster.</span>
          </h1>

          <div className="features">
            <div className="feat">
              <div className="ico b">{ICO.doc}</div>
              <div className="text">
                <div className="t">Inbox → Award in one flow</div>
                <div className="d">Triage PRs, draft PAs, run bid evaluation and route SRC — all from a single workspace.</div>
              </div>
            </div>
            <div className="feat">
              <div className="ico t">{ICO.layers}</div>
              <div className="text">
                <div className="t">Procura at every gate</div>
                <div className="d">Auto-draft schedules, suggest CE +5% language, and flag IKTVA gaps before they slow you down.</div>
              </div>
            </div>
            <div className="feat">
              <div className="ico g">{ICO.shieldCheck}</div>
              <div className="text">
                <div className="t">Compliance built-in</div>
                <div className="d">Saudization, IKTVA targets, OOK slates and SRC routing enforced automatically.</div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="systems">
            <div className="stack">
              <div className="av sap">SAP</div>
              <div className="av aae">AAE</div>
              <div className="av crm">CRM</div>
              <div className="av em">eM</div>
              <div className="av ik">IKT</div>
              <div className="av nm">+3</div>
            </div>
            <div className="text">
              <b>Integrated with</b> SAP S/4HANA, AAE, e-Marketplace &amp; iktva.sa
            </div>
          </div>
        </div>

        {/* RIGHT — sign-in card */}
        <div className="card-wrap">
          <form className="card" onSubmit={submit}>
            <h1>Welcome back, Mohammed</h1>
            <p className="sub">Sign in with your Aramco network credentials to continue.</p>

            <div className="field">
              <label htmlFor="uid">User ID</label>
              <div className="input-wrap">
                <span className="lico">{ICO.user}</span>
                <input
                  id="uid"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. GhamidiM01"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pwd">
                Password
                <a className="hint" href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </label>
              <div className="input-wrap">
                <span className="lico">{ICO.lock}</span>
                <input
                  id="pwd"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <button
                  type="button"
                  className="rico"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? ICO.eyeOff : ICO.eye}
                </button>
              </div>
            </div>

            <div className="remember">
              <label className={`cb ${remember ? 'on' : ''}`}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="box">{ICO.check}</span>
                Keep me signed in
              </label>
              <a className="lang" href="#" onClick={(e) => e.preventDefault()}>
                {ICO.globe} English / العربية
              </a>
            </div>

            <button
              ref={btnRef}
              type="submit"
              className={`submit ${loading ? 'loading' : ''}`}
              onMouseMove={trackMouse}
            >
              <span className="submit-glint" aria-hidden="true"></span>
              {loading
                ? <><span className="spinner"></span> <span className="submit-label">Signing in&hellip;</span></>
                : <>
                    <span className="submit-lock" aria-hidden="true">{ICO.lock}</span>
                    <span className="submit-label">Sign in securely</span>
                    <span className="submit-arrow" aria-hidden="true">{ICO.arrowR}</span>
                  </>}
            </button>

            <div className="or-sep">or</div>

            <button
              type="button"
              className="sso"
              onClick={() => {
                setLoading(true);
                setTimeout(() => { setLoading(false); navigate('/chat'); }, 1200);
              }}
            >
              <span className="sso-mark">{ICO.shield}</span>
              Continue with Aramco SSO
              <span className="lock">{ICO.lock}</span>
            </button>

            <div className="foot">
              <span className="shield">{ICO.shield}</span>
              256-bit encrypted · SOC 2 compliant · All sessions are logged and audited.
            </div>
          </form>
        </div>
      </div>

      <div className="corner l">
        <span>&copy; {new Date().getFullYear()} Saudi Aramco. All rights reserved.</span>
      </div>
      <div className="corner r">
        <span>Need help?</span>
        <span className="sep"></span>
        <a href="#" onClick={(e) => e.preventDefault()}>IT Service Desk</a>
        <span className="sep"></span>
        <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
      </div>
    </div>
  );
}
