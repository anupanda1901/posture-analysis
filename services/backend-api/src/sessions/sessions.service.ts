import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { PrismaService } from "../common/prisma.service";
import { SafetyService } from "../safety/safety.service";

export interface CreateSessionInput {
  subjectPseudoId: string;
  protocolId: string;
  protocolVersion: string;
  deploymentContext: "clinic_supervised" | "home_rehab";
  consentRecordId: string;
  retentionPolicy: unknown;
  calibrationRef?: string | null;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safety: SafetyService
  ) {}

  async create(input: CreateSessionInput) {
    const id = uuid();
    await this.prisma.session.create({
      data: {
        id,
        subjectPseudoId: input.subjectPseudoId,
        protocolId: input.protocolId,
        protocolVersion: input.protocolVersion,
        deploymentContext: input.deploymentContext,
        consentRecordId: input.consentRecordId,
        retentionPolicy: input.retentionPolicy as object,
        calibrationRef: input.calibrationRef ?? null,
        state: "Setup",
      },
    });
    // Seeds the actor + persisted snapshot for this session id.
    await this.safety.startSession(id);
    return this.get(id);
  }

  async get(id: string) {
    return this.prisma.session.findUniqueOrThrow({ where: { id } });
  }
}
