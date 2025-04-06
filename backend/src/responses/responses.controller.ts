import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { ResponsesService } from "./responses.service";
import { CreateResponseDto } from "./dto/create-response.dto";
import { Response } from "./entities/response.entity";
import { PaginationDto } from "../common/dto/pagination.dto";
import { BaseController } from "../common/controllers/base.controller";
import {
  ApiResponseDto,
  PaginatedResponseDto,
} from "../common/dto/api-response.dto";

@ApiTags("responses")
@Controller("responses")
export class ResponsesController extends BaseController {
  constructor(private readonly responsesService: ResponsesService) {
    super();
  }

  @Post()
  @ApiOperation({ summary: "Gửi câu trả lời cho một khảo sát" })
  @ApiResponse({
    status: 201,
    description: "Câu trả lời đã được gửi",
    type: Response,
  })
  async create(
    @Body() createResponseDto: CreateResponseDto,
    @Req() req
  ): Promise<ApiResponseDto<Response>> {
    const user = req.user || null;
    return this.success(
      await this.responsesService.create(createResponseDto, user)
    );
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Lấy danh sách tất cả câu trả lời" })
  @ApiResponse({
    status: 200,
    description: "Danh sách câu trả lời đã phân trang",
    schema: {
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Response" },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "number" },
            page: { type: "number" },
            limit: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: "surveyId",
    required: false,
    type: String,
    description: "ID của khảo sát",
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
  async findAll(
    @Query() paginationDto?: PaginationDto
  ): Promise<PaginatedResponseDto<Response>> {
    const { responses, total } =
      await this.responsesService.findAll(paginationDto);
    return this.paginate(
      responses,
      total,
      paginationDto,
      "Lấy danh sách câu trả lời thành công"
    );
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Xóa một câu trả lời" })
  @ApiResponse({ status: 200, description: "Câu trả lời đã được xóa" })
  @ApiResponse({ status: 404, description: "Không tìm thấy câu trả lời" })
  async remove(@Param("id") id: string) {
    await this.responsesService.remove(id);
    return this.success(null);
  }
}
