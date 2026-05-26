import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Shell from './components/Shell';
import Workspace from './pages/Workspace';
import PADraft from './pages/PADraft';
import FunctionalReview from './pages/FunctionalReview';
import BidEvaluation from './pages/BidEvaluation';
import AwardSign from './pages/AwardSign';
import Chat from './pages/Chat';
import Login from './pages/Login';
import ContractCockpit from './pages/ContractCockpit';
import BidSlate from './pages/BidSlate';
import CreateRequest from './pages/CreateRequest';
import Queue from './pages/Queue';
import Templates from './pages/Templates';
import Vendors from './pages/Vendors';
import Clauses from './pages/Clauses';
import Insights from './pages/Insights';
import ActivityLog from './pages/ActivityLog';

/* ─── Route map ───────────────────────────────────────────────────
   /              Workspace (CR home — inbox + KPIs + pipeline)
   /inbox         Alias for / (deep-link target)
   /chat          Procura conversation (no rail, composer auto-focus)
   /create        New service request (buyer-side catalog)
   /pa-draft, /pa-draft/:id              PA Draft list / detail
   /functional-review, /:id              Functional Review list / detail
   /bid-evaluation, /:id                 Bid Evaluation list / detail
   /bid-slate/:id                        RFP slate builder
   /award-sign, /:id                     Award & Sign list / detail
   /contract/:id                         Contract Cockpit drill-down
   /login                                Sign in
   *                                     → /
   ──────────────────────────────────────────────────────────────── */
/* Auth gate — sign-in is the landing page until user logs in. Login submit
   sets localStorage['cr-auth'] = '1'; subsequent visits skip login. */
function RequireAuth({ children }) {
  const loc = useLocation();
  const authed = typeof window !== 'undefined' && localStorage.getItem('cr-auth') === '1';
  if (!authed) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Shell /></RequireAuth>}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Workspace />} />
          <Route path="/inbox" element={<Queue which="inbox" />} />
          <Route path="/reviews" element={<Queue which="reviews" />} />
          <Route path="/bidding" element={<Queue which="bidding" />} />
          <Route path="/awards" element={<Queue which="awards" />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/create" element={<CreateRequest />} />
          <Route path="/pa-draft" element={<PADraft />} />
          <Route path="/pa-draft/:id" element={<PADraft />} />
          <Route path="/functional-review" element={<FunctionalReview />} />
          <Route path="/functional-review/:id" element={<FunctionalReview />} />
          <Route path="/bid-evaluation" element={<BidEvaluation />} />
          <Route path="/bid-evaluation/:id" element={<BidEvaluation />} />
          <Route path="/bid-slate/:id" element={<BidSlate />} />
          <Route path="/award-sign" element={<AwardSign />} />
          <Route path="/award-sign/:id" element={<AwardSign />} />
          <Route path="/contract/:id" element={<ContractCockpit />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/clauses" element={<Clauses />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
