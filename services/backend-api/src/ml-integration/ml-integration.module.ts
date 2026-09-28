import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventsModule } from "../events/events.module";
import { SafetyModule } from "../safety/safety.module";
import { WsModule } from "../ws/ws.module";
import { FramesController } from "./frames.controller";
import { MlClientService } from "./ml-client.service";
import { MlResultConsumer } from "./ml-result.consumer";

@Module({
  imports: [ConfigModule, EventsModule, SafetyModule, WsModule],
  controllers: [FramesController],
  providers: [MlClientService, MlResultConsumer],
  exports: [MlClientService, MlResultConsumer],
})
export class MlIntegrationModule {}
