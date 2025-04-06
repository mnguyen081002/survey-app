import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpStatus,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { SurveysService } from "./surveys.service";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { Survey } from "./entities/survey.entity";
import { PaginationDto } from "../common/dto/pagination.dto";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";
import { BaseController } from "../common/controllers/base.controller";
import {
  ApiResponseDto,
  PaginatedResponseDto,
} from "../common/dto/api-response.dto";
import { GetListSurveyDto } from "./dto/get-list-survey.dto";
import { User } from "src/users/entities/user.entity";
import { AuthUser } from "src/common/decorators/auth-user.decorator";

@ApiTags("surveys")
@Controller("surveys")
export class SurveysController extends BaseController {
  constructor(private readonly surveysService: SurveysService) {
    super();
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Tạo một survey mới" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Survey đã được tạo",
    type: () => ApiResponseDto<Survey>,
  })
  async create(
    @Body() createSurveyDto: CreateSurveyDto,
    @Req() req
  ): Promise<ApiResponseDto<Survey>> {
    const survey = await this.surveysService.create(createSurveyDto, req.user);
    return this.created(survey, "Survey đã được tạo thành công");
  }
  @Get("my-surveys")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lấy danh sách survey của người dùng hiện tại" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Danh sách survey của người dùng đã phân trang",
    type: () => PaginatedResponseDto<Survey>,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Số trang, bắt đầu từ 1",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Số lượng item mỗi trang",
  })
  async findMyOnes(
    @Req() req,
    @Query() query: GetListSurveyDto
  ): Promise<PaginatedResponseDto<Survey>> {
    const { data, total } = await this.surveysService.findAllByUser(
      req.user.id,
      query
    );
    return this.paginate(
      data,
      total,
      query,
      "Lấy danh sách survey của bạn thành công"
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin chi tiết một survey" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Thông tin survey",
    type: () => ApiResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Không tìm thấy survey",
  })
  async findOne(@Param("id") id: string): Promise<ApiResponseDto<Survey>> {
    const survey = await this.surveysService.findOne(id);
    return this.success(survey, "Lấy thông tin survey thành công");
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cập nhật một survey" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Survey đã được cập nhật",
    type: () => ApiResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Không tìm thấy survey",
  })
  async update(
    @Param("id") id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
    @AuthUser() user: User
  ): Promise<ApiResponseDto<Survey>> {
    const updatedSurvey = await this.surveysService.update(
      { id, creator: { id: user.id } },
      updateSurveyDto
    );
    return this.success(updatedSurvey, "Cập nhật survey thành công");
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xóa một survey" })
  @ApiResponse({ status: HttpStatus.OK, description: "Survey đã được xóa" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Không tìm thấy survey",
  })
  async remove(@Param("id") id: string): Promise<ApiResponseDto<null>> {
    await this.surveysService.remove(id);
    return this.success(null, "Xóa survey thành công");
  }

  @Get("dashboard/stats")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lấy thống kê cho dashboard" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Thống kê dashboard",
    type: () => ApiResponseDto<DashboardStatsDto>,
  })
  async getDashboardStats(
    @Req() req
  ): Promise<ApiResponseDto<DashboardStatsDto>> {
    const stats = await this.surveysService.getDashboardStats(req.user.id);
    return this.success(stats, "Lấy thống kê dashboard thành công");
  }
}
