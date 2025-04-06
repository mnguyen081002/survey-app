import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
  @ApiProperty({ description: "Tổng số bản ghi", example: 100 })
  total: number;

  @ApiProperty({ description: "Trang hiện tại", example: 1 })
  page: number;

  @ApiProperty({ description: "Số lượng bản ghi mỗi trang", example: 10 })
  limit: number;

  @ApiProperty({ description: "Tổng số trang", example: 10 })
  totalPages: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: "Thông báo", example: "Thao tác thành công" })
  message: string;

  @ApiProperty({ description: "Dữ liệu trả về", example: null, nullable: true })
  data: T | null;

  @ApiProperty({
    description: "Metadata phân trang (nếu có)",
    type: PaginationMetaDto,
    required: false,
  })
  meta?: PaginationMetaDto;

  @ApiProperty({
    description: "Chi tiết lỗi (nếu có)",
    example: null,
    nullable: true,
    required: false,
  })
  errors?: any;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({ description: "Dữ liệu dạng mảng", type: Array, isArray: true })
  data: T[];

  @ApiProperty({ description: "Metadata phân trang", type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
