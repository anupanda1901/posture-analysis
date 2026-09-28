/* eslint-disable */
/**
 * Generated from packages/schemas/src/session.schema.json - DO NOT EDIT BY HAND.
 * Run `npm run schemas:generate` to regenerate.
 */

/**
 * A session record: pseudonymous subject, site/protocol/version, consent scope, retention policy, calibration ref, and current safety-FSM state (PRD 1.6, TRD 2.4/2.5).
 */
export interface Session {
  sessionId: string;
  subjectPseudoId: string;
  protocolId: string;
  protocolVersion: string;
  deploymentContext: "clinic_supervised" | "home_rehab";
  /**
   * Reference to a ConsentRecord.
   */
  consentRecordId: string;
  retentionPolicy: {
    rawVideo: {
      optIn: boolean;
      retentionDays: number | null;
    };
    derivedEvents: {
      retentionDays: number;
    };
  };
  calibrationRef?: string | null;
  state: "Setup" | "Observing" | "CueEligible" | "Pause" | "Unavailable" | "ClinicianReview";
  createdAt: string;
}
