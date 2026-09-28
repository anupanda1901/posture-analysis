import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { MlIntegrationModule } from "./ml-integration/ml-integration.module";
import { ProtocolsModule } from "./protocols/protocols.module";
import { SafetyModule } from "./safety/safety.module";
import { SessionsModule } from "./sessions/sessions.module";
import { SymptomsModule } from "./symptoms/symptoms.module";
import { WsModule } from "./ws/ws.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    ProtocolsModule,
    SessionsModule,
    EventsModule,
    SafetyModule,
    SymptomsModule,
    MlIntegrationModule,
    WsModule,
  ],
})
export class AppModule {}
