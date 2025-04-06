import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResponsesService } from "./responses.service";
import { ResponsesController } from "./responses.controller";
import { Response } from "./entities/response.entity";
import { Survey } from "../surveys/entities/survey.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Response, Survey])],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
