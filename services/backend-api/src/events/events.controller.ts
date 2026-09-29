import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { EventsService } from "./events.service";

/** The full append-only event log for a session - clinician-only (docs/adr/010). */
@Controller("sessions/:sessionId/events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("clinician")
  @Get()
  list(@Param("sessionId") sessionId: string) {
    return this.events.listForSession(sessionId);
  }
}
