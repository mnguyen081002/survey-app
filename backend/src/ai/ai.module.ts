import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { Survey } from "../surveys/entities/survey.entity";
import { ResponsesService } from "src/responses/responses.service";
import { ResponsesModule } from "src/responses/responses.module";
import { SurveysModule } from "src/surveys/surveys.module";

@Module({
  imports: [
    ConfigModule,
    ResponsesModule,
    TypeOrmModule.forFeature([Survey]),
    SurveysModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
