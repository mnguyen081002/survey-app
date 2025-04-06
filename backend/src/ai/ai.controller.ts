import {
  Body,
  Controller,
  Post,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AiService } from "./ai.service";
import { GenerateSummaryDto } from "./dto/generate-summary.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Survey } from "../surveys/entities/survey.entity";
import { AuthGuard } from "@nestjs/passport";
import { BaseController } from "../common/controllers/base.controller";
import { ResponsesService } from "src/responses/responses.service";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { SurveysService } from "src/surveys/surveys.service";
@ApiTags("AI")
@Controller("ai")
export class AiController extends BaseController {
  constructor(
    private readonly aiService: AiService,
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    private readonly responsesService: ResponsesService,
    private readonly surveyService: SurveysService
  ) {
    super();
  }

  @Post("generate-summary")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Tạo tóm tắt AI cho câu trả lời khảo sát" })
  @ApiResponse({
    status: 200,
    description: "Tóm tắt AI đã được tạo thành công",
    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Dữ liệu không hợp lệ hoặc lỗi xử lý",
  })
  @ApiResponse({ status: 401, description: "Không được phép truy cập" })
  @ApiResponse({ status: 404, description: "Không tìm thấy khảo sát" })
  async generateSummary(@Body() generateSummaryDto: GenerateSummaryDto) {
    const { surveyId } = generateSummaryDto;

    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(
        `Không tìm thấy khảo sát với ID: ${surveyId}`
      );
    }

    const answers = await this.responsesService.findBySurvey(
      surveyId,
      new PaginationDto()
    );

    if (answers.responses.length === 0) {
      return this.success({ summary: "Không có dữ liệu để tạo tóm tắt" });
    }

    const summary = await this.aiService.generateSummary(survey, answers);

    if (!summary) {
      throw new BadRequestException(
        "Không thể tạo tóm tắt AI. Vui lòng thử lại sau."
      );
    }

    await this.surveyService.update(
      { id: surveyId },
      {
        aiSummary: summary,
      }
    );

    return this.success({ summary });
  }
}
