import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SurveysService } from "./surveys.service";
import { SurveysController } from "./surveys.controller";
import { Survey } from "./entities/survey.entity";
import { Response } from "../responses/entities/response.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Response])],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
