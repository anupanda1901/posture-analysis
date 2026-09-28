import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface FrameSubmission {
  sessionId: string;
  frameId: string;
  capturedAt: string;
  imageBase64: string;
}

export interface MlFrameResult {
  poseLandmarkFrame: unknown;
  qualityGateFlag: unknown;
}

/** Thin HTTP client to ml-service's internal API (ADR-003: synchronous REST for this phase). */
@Injectable()
export class MlClientService {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.get<string>("ML_SERVICE_URL") ?? "http://localhost:8000";
  }

  async sendFrame(submission: FrameSubmission): Promise<MlFrameResult> {
    const response = await fetch(`${this.baseUrl}/internal/frames`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "<no body>");
      throw new InternalServerErrorException(`ml-service returned ${response.status}: ${text}`);
    }

    return (await response.json()) as MlFrameResult;
  }
}
