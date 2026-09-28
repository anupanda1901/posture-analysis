import { Injectable, Logger } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { EventsService } from "../events/events.service";
import { SafetyService } from "../safety/safety.service";
import { SessionGateway } from "../ws/session.gateway";
import type { MlFrameResult } from "./ml-client.service";

interface QualityGateFlagShape {
  flagId: string;
  state: "supported" | "unsupported";
  reasons: string[];
}

/**
 * Consumes ml-service's per-frame result. Validates against the canonical
 * schemas before anything is logged or acted on, and enforces the rule that
 * matters most for this phase: a quality-gate-flag with state=unsupported MUST
 * suppress any cue - the only DecisionEvent this consumer is allowed to emit for
 * an unsupported frame is `measurement_unavailable`, never `cue`. There is no
 * cue-generation model in this phase (ST-GCN/TCN is deferred), so a *supported*
 * frame currently produces no DecisionEvent at all rather than a fabricated one.
 */
@Injectable()
export class MlResultConsumer {
  private readonly logger = new Logger(MlResultConsumer.name);

  constructor(
    private readonly events: EventsService,
    private readonly safety: SafetyService,
    private readonly gateway: SessionGateway
  ) {}

  async handleFrame(sessionId: string, result: MlFrameResult) {
    await this.events.appendValidated(sessionId, "pose-landmark-frame", result.poseLandmarkFrame);
    await this.events.appendValidated(sessionId, "quality-gate-flag", result.qualityGateFlag);
    this.gateway.broadcast(sessionId, "pose-landmark-frame", result.poseLandmarkFrame);
    this.gateway.broadcast(sessionId, "quality-gate-flag", result.qualityGateFlag);

    const qualityGateFlag = result.qualityGateFlag as QualityGateFlagShape;

    if (qualityGateFlag.state === "unsupported") {
      const decisionEvent = {
        decisionEventId: uuid(),
        sessionId,
        evaluatedAt: new Date().toISOString(),
        evidence: [{ type: "quality-gate-flag", refId: qualityGateFlag.flagId, summary: qualityGateFlag.reasons.join(",") }],
        rule: {
          ruleId: "HZ-03",
          ruleVersion: "v0",
          description: "Quality gate reported unsupported - suppress any corrective cue.",
        },
        action: "measurement_unavailable" as const,
        cuePayload: null,
        version: "policy-v0",
        expiry: new Date(Date.now() + 5000).toISOString(),
      };
      await this.events.appendValidated(sessionId, "decision-event", decisionEvent);
      this.gateway.broadcast(sessionId, "decision-event", decisionEvent);

      const safetyState = await this.safety.send(sessionId, {
        type: "QUALITY_LOST",
        reason: qualityGateFlag.reasons[0] ?? "unsupported",
      });
      this.gateway.broadcast(sessionId, "state", { state: safetyState });

      return { decisionEvent, safetyState };
    }

    this.logger.debug(`session ${sessionId}: quality supported, no cue model in this phase - no decision event`);
    const safetyState = await this.safety.getState(sessionId);
    return { decisionEvent: null, safetyState };
  }
}
