/* ─── Canonical PA status registry ────────────────────────────────
 * Single source of truth for PA workflow status. Backed by localStorage
 * so changes survive reloads and are visible everywhere (Overview,
 * Inbox queue, Reviews queue, Bidding queue, Awards queue, all wizard
 * screens, and the PA hero).
 *
 * Status enum is FROZEN — do not add ad-hoc strings elsewhere.
 * ─────────────────────────────────────────────────────────────── */

export const PA_STATUS = {
  INTAKE:        'intake',        // P3 · in Inbox, awaiting CR action
  PA_DRAFT:      'pa-draft',      // P4a · CR drafting the PA
  FUNCTIONAL:    'functional',    // P4a · concurrence lanes routing
  BID_SLATE:     'bid-slate',     // P4b · RFP package being assembled
  BIDDING:       'bidding',       // P4b · RFP issued, bid window open
  BID_EVAL:      'bid-eval',      // P4c · BRT/IRT/composite ranking
  AWARD_SIGN:    'award-sign',    // P4c · award packet + SRC
  EXECUTED:      'executed',      // P5  · contract live, in cockpit
  RETURNED:      'returned',      // Handed back to proponent (Pending intake)
  ON_HOLD:       'on-hold',       // Paused by CR / CD Manager
};

/* Display labels — ONE canonical form per status, used EVERYWHERE
   (Workspace inbox / Inbox queue / Reviews queue / Bidding queue /
   Awards queue / PA hero / header context chip / cards / tooltips).
   No "In " prefix. No queue-specific shortened variants. Single source. */
export const STATUS_LABELS = {
  intake:      'New PR',
  'pa-draft':  'PA Draft',
  functional:  'Functional Review',
  'bid-slate': 'Bid Slate',
  bidding:     'Bidding',
  'bid-eval':  'Bid Evaluation',
  'award-sign':'Award & Sign',
  executed:    'Executed',
  returned:    'Returned',
  'on-hold':   'On hold',
};

/* Legacy alias — kept so any older import doesn't break. Points at the same map. */
export const STATUS_LABELS_LONG = STATUS_LABELS;

/* Chip tone (status-chip class) per status — single mapping reused everywhere. */
/* Canonical chip tone — matches CSS classes on .status-chip and .status-pill.
   Values: 'info' | 'warn' | 'success' | 'critical' | 'neutral'. */
export const STATUS_TONE = {
  intake:       'info',
  'pa-draft':   'warn',
  functional:   'warn',
  'bid-slate':  'warn',
  bidding:      'info',
  'bid-eval':   'warn',
  'award-sign': 'warn',
  executed:     'success',
  returned:     'critical',
  'on-hold':    'critical',
};

/* Stage (1-indexed of 7) per status — drives PaHero + header context chip. */
export const STATUS_STAGE = {
  intake:       1,
  'pa-draft':   2,
  functional:   3,
  'bid-slate':  4,
  bidding:      5,
  'bid-eval':   6,
  'award-sign': 7,
  executed:     7,
  returned:     1,
  'on-hold':    1,
};

const STORAGE_KEY = 'cr-app:pa-status:v1';

/* Seed data — initial canonical statuses per PA. Used when localStorage is empty. */
const SEED = {
  'PR-2026-04481': { pa: 'PA-LFPA-0218', status: PA_STATUS.FUNCTIONAL,  updatedAt: Date.now() },
  'PR-2026-04476': { pa: null,           status: PA_STATUS.INTAKE,      updatedAt: Date.now() },
  'PR-2026-04471': { pa: null,           status: PA_STATUS.PA_DRAFT,    updatedAt: Date.now() },
  'PR-2026-04458': { pa: 'PA-LFPA-0237', status: PA_STATUS.FUNCTIONAL,  updatedAt: Date.now() },
  'PR-2026-04449': { pa: 'PA-LFPA-0241', status: PA_STATUS.BIDDING,     updatedAt: Date.now() },
  'PR-2026-04432': { pa: 'PA-LFPA-0218B',status: PA_STATUS.BID_EVAL,    updatedAt: Date.now() },
  'PR-2026-04425': { pa: 'PA-LFPA-0205A',status: PA_STATUS.FUNCTIONAL,  updatedAt: Date.now() },
  'PR-2026-04419': { pa: 'PA-LFPA-0212', status: PA_STATUS.BIDDING,     updatedAt: Date.now() },
  'PR-2026-04402': { pa: 'PA-LFPA-0202', status: PA_STATUS.AWARD_SIGN,  updatedAt: Date.now() },
  'PR-2026-04391': { pa: 'PA-LFPA-0210', status: PA_STATUS.BID_EVAL,    updatedAt: Date.now() },
  'PR-2026-04380': { pa: 'PA-LFPA-0220', status: PA_STATUS.AWARD_SIGN,  updatedAt: Date.now() },
};

function load() {
  if (typeof localStorage === 'undefined') return { ...SEED };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SEED };
    const parsed = JSON.parse(raw);
    // merge with seed so newly-added rows pick up defaults
    return { ...SEED, ...parsed };
  } catch {
    return { ...SEED };
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota / disabled — silently fail */ }
}

const listeners = new Set();
let state = load();

export function getAllPaStatus() { return { ...state }; }

export function getPaStatus(prCode) {
  return state[prCode] || { status: PA_STATUS.INTAKE, updatedAt: Date.now() };
}

export function setPaStatus(prCode, patch) {
  const next = { ...state, [prCode]: { ...(state[prCode] || {}), ...patch, updatedAt: Date.now() } };
  state = next;
  save(next);
  listeners.forEach((cb) => cb(next));
}

export function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/* React hook for components that need to react to status changes. */
import { useEffect, useState } from 'react';
export function usePaStatusMap() {
  const [snap, setSnap] = useState(state);
  useEffect(() => subscribe(setSnap), []);
  return snap;
}
