import { ApiProperty } from "@nestjs/swagger";

export class SurveyStatItem {
  @ApiProperty({
    description: "ID của survey",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Tiêu đề của survey",
    example: "Khảo sát về sản phẩm mới",
  })
  title: string;

  @ApiProperty({
    description: "Mô tả của survey",
    example: "Đánh giá về trải nghiệm sản phẩm",
  })
  description?: string;

  @ApiProperty({
    description: "Số lượng phản hồi",
    example: 150,
  })
  responseCount: number;

  @ApiProperty({
    description: "Trạng thái hoạt động",
    example: "active",
  })
  status: "active" | "inactive";

  @ApiProperty({
    description: "Ngày tạo",
    example: "2023-06-15T10:00:00.000Z",
  })
  createdAt: Date;
}

export class DashboardStatsDto {
  @ApiProperty({
    description: "Tổng số survey",
    example: 15,
  })
  totalSurveys: number;

  @ApiProperty({
    description: "Số survey đang hoạt động",
    example: 12,
  })
  activeSurveys: number;

  @ApiProperty({
    description: "Tổng số phản hồi",
    example: 256,
  })
  totalResponses: number;

  @ApiProperty({
    description: "Trung bình số phản hồi trên mỗi survey",
    example: 17.1,
  })
  averageResponses: number;

  @ApiProperty({
    description: "Tỷ lệ survey hoàn thành",
    example: 80,
  })
  completionRate: number;

  @ApiProperty({
    description: "Danh sách các survey gần đây",
    type: [SurveyStatItem],
  })
  recentSurveys: SurveyStatItem[];
}
