import { HttpStatus } from "@nestjs/common";
import {
  ApiResponseDto,
  PaginatedResponseDto,
  PaginationMetaDto,
} from "../dto/api-response.dto";
import { PaginationDto } from "../dto/pagination.dto";

/**
 * Controller cơ sở với các phương thức tiện ích để xử lý response
 */
export class BaseController {
  /**
   * Tạo response phân trang chuẩn hóa
   * @param data Dữ liệu trả về
   * @param total Tổng số bản ghi
   * @param paginationDto DTO chứa thông tin phân trang
   * @param message Thông báo tùy chỉnh
   * @param statusCode HTTP status code
   * @returns Response đã được định dạng
   */
  paginate<T>(
    data: T[],
    total: number,
    paginationDto: PaginationDto,
    message = "Dữ liệu đã được tải thành công",
    statusCode = HttpStatus.OK
  ): PaginatedResponseDto<T> {
    const { page, limit } = paginationDto;
    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMetaDto = {
      total,
      page,
      limit,
      totalPages,
    };

    return {
      message,
      data,
      meta,
    };
  }

  /**
   * Tạo response thành công chuẩn hóa
   * @param data Dữ liệu trả về
   * @param message Thông báo tùy chỉnh
   * @param statusCode HTTP status code
   * @returns Response đã được định dạng
   */
  success<T>(
    data: T,
    message = "Thao tác thành công",
    statusCode = HttpStatus.OK
  ): ApiResponseDto<T> {
    return {
      message,
      data,
    };
  }

  /**
   * Tạo response lỗi chuẩn hóa
   * @param message Thông báo lỗi
   * @param statusCode HTTP status code
   * @param errors Chi tiết lỗi (nếu có)
   * @returns Response đã được định dạng
   */
  error(
    message = "Đã xảy ra lỗi",
    statusCode = HttpStatus.BAD_REQUEST,
    errors?: any
  ): ApiResponseDto<null> {
    return {
      message,
      data: null,
      errors,
    };
  }

  /**
   * Tạo response cho tạo mới thành công
   * @param data Dữ liệu đã tạo
   * @param message Thông báo tùy chỉnh
   * @returns Response đã được định dạng với status 201
   */
  created<T>(data: T, message = "Tạo mới thành công"): ApiResponseDto<T> {
    return this.success(data, message, HttpStatus.CREATED);
  }

  /**
   * Tạo response không có nội dung
   * @param message Thông báo tùy chỉnh
   * @returns Response đã được định dạng với status 204
   */
  noContent(message = "Không có nội dung"): ApiResponseDto<null> {
    return this.success(null, message, HttpStatus.NO_CONTENT);
  }
}
