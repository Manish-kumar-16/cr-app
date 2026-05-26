import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ICO } from './Icons';
import logoSrc from '../assets/procura-orb.png';

/* Context-aware Procura advice — keyed by route path + URL hash (sub-step).
   When the user is on a screen with a step, the rail shows step-specific tips
   instead of the generic priority briefs. */
const CONTEXT_TIPS = {
  '/pa-draft#template': {
    title: 'Helping you · Pick template',
    tips: [
      ['Why MP-IK-LSTK?', 'This PR is Major Project (≥$50M), In-Kingdom, turnkey — MP-IK-LSTK is the standard match.'],
      ['Reviewers locked', 'Law · CP&CCD · Tech (default for this template).'],
      ['Schedules auto', 'B, C, S/H, G — verified against PR scope.'],
    ],
  },
  '/pa-draft#schedules': {
    title: 'Helping you · Confirm schedules',
    tips: [
      ['Schedule B', 'Auto-built from the PR scope of work.'],
      ['Schedule S', '35% Ops Saudization; SM-level 12% — both met by your last 6 awards.'],
      ['Add custom?', 'Only if the PR has unusual scope (e.g. multi-site).'],
    ],
  },
  '/pa-draft#strategy': {
    title: 'Helping you · Set strategy',
    tips: [
      ['Window 14 days', 'Matches Aramco LFPA standard for $50M+ scope.'],
      ['Seal + open CE', 'After BRT — protects against bidder reverse-engineering.'],
      ['Tighter than 10d', 'Expect fewer responses.'],
    ],
  },
  '/pa-draft#reviewers': {
    title: 'Helping you · Assign reviewers',
    tips: [
      ['Skipping SMPCAD', 'Fine — only needed when Schedule C has materials ≥$1M.'],
      ['F. Al-Nasser', 'Responsive (avg 1.8 days vs 2-day SLA).'],
      ['Total review SLA', '~3 days with current selection.'],
    ],
  },
  '/pa-draft#finalize': {
    title: 'Helping you · Generate & route',
    tips: [
      ['Clause library', 'v3.2 (latest) will be used.'],
      ['Schedules', 'All attached and Procura-watermarked.'],
      ['Edits later', 'You can still tune clause language in Functional Review.'],
    ],
  },
  '/functional-review': {
    title: 'Helping you · Functional Review',
    tips: [
      ['IKTVA returned', 'Fix Saudization (SM) to 12% before re-routing.'],
      ['Law endorsed', 'Clauses 8.2, 14.1 amended per OOK exception.'],
      ['2 of 5 done', 'Nudge CP&CCD + SMPCAD to keep SLA.'],
    ],
  },
  '/bid-slate': {
    title: 'Helping you · Bid Slate',
    tips: [
      ['8 IKTVA-qualified', '6 already slated, 2 held in reserve.'],
      ['OOK flag on Saipem', '56% beneficial ownership shared with Al-Yamamah.'],
      ['Best in pool', 'NPCC KSA at 81% IKTVA.'],
    ],
  },
  '/bid-evaluation': {
    title: 'Helping you · Bid Evaluation',
    tips: [
      ['Lowest bid', '+3.7% vs CE — within tolerance.'],
      ['CE +5% rule', 'B2, B3, B6 over threshold — memo needed.'],
      ['OOK overlap', 'B4 shares 56% ownership with B2 — resolve.'],
    ],
  },
  '/award-sign': {
    title: 'Helping you · Award & Sign',
    tips: [
      ['Composite winner', 'ZahidEng JV at 92 — strong tech + IKTVA mix.'],
      ['Savings', '$5.6M vs highest bid.'],
      ['Next gate', 'SRC Secretary compiles tomorrow 09:00.'],
    ],
  },
  '/contract': {
    title: 'Helping you · Contract Cockpit',
    tips: [
      ['IKTVA Q1 overdue', 'Self-cert was due 2026-04-30 — chase the vendor.'],
      ['VO #3 approved', '$520K cathodic protection added — track in burndown.'],
      ['Performance 4.6/5', 'Q2 evaluation logged.'],
    ],
  },
};

function resolveContext(pathname, hash) {
  const key = pathname + (hash || '');
  if (CONTEXT_TIPS[key]) return CONTEXT_TIPS[key];
  if (pathname.startsWith('/pa-draft')) return CONTEXT_TIPS['/pa-draft#template'];
  if (pathname.startsWith('/bid-slate')) return CONTEXT_TIPS['/bid-slate'];
  if (pathname.startsWith('/contract')) return CONTEXT_TIPS['/contract'];
  return CONTEXT_TIPS[pathname] || null;
}

export default function ProcuraRail({ onCollapse, animClass = '' }) {
  const location = useLocation();
  const [thinking, setThinking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const ctx = resolveContext(location.pathname, location.hash);

  return (
    <aside className={'rail ' + animClass}>
      {/* Animated left-edge glow — ambient "alive" presence */}
      <span className="rail-edge-glow" aria-hidden="true"></span>

      {/* Head */}
      <div className="rail-head">
        <div className="av">
          <img src={logoSrc} alt="Procura" className="logo-img" />
        </div>
        <div className="info">
          <div className="name">Procura</div>
          <div className="status">
            <span className="status-orb" aria-hidden="true">
              <span className="status-orb-inner"></span>
            </span>
            <span className="status-label">Online</span>
            <span className="status-sep">·</span>
            <span className="status-model">Metabrain</span>
          </div>
        </div>
        <button
          type="button"
          className="rail-collapse-btn"
          onClick={onCollapse}
          title="Minimise Procura"
          aria-label="Minimise Procura assistant"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <button className="menu" title="More">{ICO.more}</button>
      </div>

      {/* Greeting — concise, action-led OR context-aware tip */}
      <div className="rail-greet">
        <div className="rail-greet-bubble">
          {thinking ? (
            <span className="typing"><i></i><i></i><i></i></span>
          ) : ctx ? (
            <>
              <b>{ctx.title}</b>
              <br/><span className="m">Tips below are tuned to where you are right now.</span>
            </>
          ) : (
            <>
              <b>Morning, Mohammed.</b>
              <br/><span className="m">3 things worth your attention — a Tanajib CE deviation, a Khurais slate to seed, and an award ready for SRC.</span>
            </>
          )}
        </div>
        <span className="rail-sync">
          <span className="rail-sync-dot"></span>
          Synced 2 min ago
        </span>
      </div>

      {/* Body — context-aware: step tips when on a transactional screen, else priority briefs */}
      <div className="rail-body">
        {ctx ? (
          <div className="rail-section">
            <h4>Tips for this step</h4>
            {ctx.tips.map(([t, s], i) => (
              <button key={i} className="rail-pill" type="button">
                <span className="ic">{ICO.sparkle}</span>
                <span className="body">
                  <span className="t">{t}</span>
                  <span className="s">{s}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
        <>
        <div className="rail-section">
          <h4>Priority briefs</h4>
          <button className="rail-pill">
            <span className="ic">{ICO.stats}</span>
            <span className="body">
              <span className="t">Investigate CE deviation</span>
              <span className="s">PA-LFPA-0218 · Tanajib — low bid is 13% over Company Estimate</span>
            </span>
            <span className="ic-dot"></span>
          </button>
          <button className="rail-pill">
            <span className="ic">{ICO.search}</span>
            <span className="body">
              <span className="t">Seed a Khurais slate</span>
              <span className="s">8 IKTVA-qualified vendors ready from GBS · no OOK conflicts</span>
            </span>
            <span className="ic-dot"></span>
          </button>
          <button className="rail-pill">
            <span className="ic">{ICO.flow}</span>
            <span className="body">
              <span className="t">Draft a CE +5% memo</span>
              <span className="s">Playbook & 4 anchor positions, tuned to your last 6 awards</span>
            </span>
          </button>
          <button className="rail-pill">
            <span className="ic">{ICO.award}</span>
            <span className="body">
              <span className="t">Send Berri award to SRC</span>
              <span className="s">Composite ranking signed · package ready in one click</span>
            </span>
            <span className="ic-dot"></span>
          </button>
        </div>

        <div className="rail-section">
          <h4>What I can do</h4>
          <button className="rail-pill">
            <span className="ic">{ICO.paper}</span>
            <span className="body">
              <span className="t">Read a contract for you</span>
              <span className="s">Summaries, clause lifts, risk callouts — in seconds</span>
            </span>
          </button>
          <button className="rail-pill">
            <span className="ic">{ICO.shield}</span>
            <span className="body">
              <span className="t">Pre-check compliance</span>
              <span className="s">SRC thresholds, IKTVA waivers, OOK overlap — before you submit</span>
            </span>
          </button>
        </div>
        </>
        )}
      </div>

      {/* Quick actions — verb-led, short */}
      <div className="rail-actions">
        <button className="pill">Brief my inbox</button>
        <button className="pill">Find OOK overlap</button>
        <button className="pill">Draft minutes</button>
      </div>

      {/* Composer */}
      <div className="rail-input">
        <div className="rail-composer">
          <button className="icbtn" title="Attach">{ICO.attach}</button>
          <input placeholder="Ask Procura — or type / for commands" />
          <button className="send" title="Send">{ICO.send}</button>
        </div>
        <div className="rail-foot">AI suggestions only · final calls stay with the CR.<span className="slash">/help</span></div>
      </div>
    </aside>
  );
}
