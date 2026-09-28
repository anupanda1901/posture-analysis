import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { EventsModule } from "../events/events.module";
import { WsModule } from "../ws/ws.module";
import { ExposureAggregatorService } from "./exposure-aggregator.service";
import { ExposureController } from "./exposure.controller";

@Module({
  imports: [EventsModule, WsModule],
  controllers: [ExposureController],
  providers: [ExposureAggregatorService, PrismaService],
  exports: [ExposureAggregatorService],
})
export class ExposureModule {}
