import { Route, Routes } from "react-router-dom";
import { SessionDetailPage } from "./pages/SessionDetailPage";
import { SessionQueuePage } from "./pages/SessionQueuePage";

/**
 * Clinician review surface for beAIve (TRD's "clinician review" requirement -
 * previously just a queryable API with no UI, per the Phase 2/3 plan's
 * deferred list). Read-only: this app never writes to a session - all
 * mutating actions (clinician-approved resume, escalation) remain
 * API-only/future work; see README.md and docs/adr/009-clinician-web-trust-model.md
 * for the current no-auth trust model this runs under.
 */
export function App() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <h1 className="app-shell__title">beAIve clinician review</h1>
      </header>
      <main className="app-shell__main">
        <Routes>
          <Route path="/" element={<SessionQueuePage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
