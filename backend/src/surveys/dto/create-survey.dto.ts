import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsObject,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSurveyDto {
  @ApiProperty({
    description: "Tiêu đề survey",
    example: "Khảo sát mức độ hài lòng về sản phẩm",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Mô tả survey",
    example: "Khảo sát này giúp chúng tôi thu thập phản hồi về sản phẩm mới",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Danh sách câu hỏi dạng JSON",
    example: [
      { type: "text", name: "q1", title: "Bạn thấy sản phẩm thế nào?" },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  questions: any;

  @ApiProperty({
    description: "JSON đầy đủ của Survey định dạng SurveyJS",
    example: {
      title: "Survey",
      questions: [{ type: "text", name: "q1", title: "Câu hỏi 1?" }],
    },
  })
  @IsObject()
  @IsNotEmpty()
  json: any;

  @ApiProperty({ description: "Trạng thái active của survey", example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
