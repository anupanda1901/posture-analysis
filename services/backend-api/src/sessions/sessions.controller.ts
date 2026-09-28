import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { SafetyService } from "../safety/safety.service";
import { CreateSessionInput, SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly safety: SafetyService
  ) {}

  @Post()
  create(@Body() body: CreateSessionInput) {
    return this.sessions.create(body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.sessions.get(id);
  }

  /**
   * Setup -> Observing, once the client confirms calibration and consent are
   * in place (TRD 2.5). Kept as an explicit step rather than folding into
   * create() because a real client may need to run a calibration flow
   * (apps/ios-client CalibrationFlowView) between the two.
   */
  @Post(":id/calibrate")
  async calibrate(@Param("id") id: string) {
    const state = await this.safety.send(id, { type: "CALIBRATED" });
    return { id, state };
  }

  @Post(":id/setup-unavailable")
  async setupUnavailable(@Param("id") id: string, @Body() body: { reason: string }) {
    const state = await this.safety.send(id, { type: "SETUP_UNAVAILABLE", reason: body.reason });
    return { id, state };
  }
}
