import { Controller, Get, Param } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("sessions/:sessionId/events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Param("sessionId") sessionId: string) {
    return this.events.listForSession(sessionId);
  }
}
