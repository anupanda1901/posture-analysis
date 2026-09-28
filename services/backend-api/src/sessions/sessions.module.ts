import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SafetyModule } from "../safety/safety.module";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

@Module({
  imports: [SafetyModule],
  controllers: [SessionsController],
  providers: [SessionsService, PrismaService],
  exports: [SessionsService],
})
export class SessionsModule {}
