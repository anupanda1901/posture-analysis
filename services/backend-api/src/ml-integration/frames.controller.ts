import { Body, Controller, Param, Post } from "@nestjs/common";
import { MlClientService } from "./ml-client.service";
import { MlResultConsumer } from "./ml-result.consumer";

interface SubmitFrameBody {
  frameId: string;
  capturedAt: string;
  imageBase64: string;
}

/** Entry point for "push a frame through ml-service -> backend-api" (see docs/ verification plan). */
@Controller("sessions/:sessionId/frames")
export class FramesController {
  constructor(
    private readonly mlClient: MlClientService,
    private readonly mlResultConsumer: MlResultConsumer
  ) {}

  @Post()
  async submit(@Param("sessionId") sessionId: string, @Body() body: SubmitFrameBody) {
    const result = await this.mlClient.sendFrame({ sessionId, ...body });
    return this.mlResultConsumer.handleFrame(sessionId, result);
  }
}
