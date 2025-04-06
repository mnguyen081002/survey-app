import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateResponseDto {
  @ApiProperty({
    description: "ID của survey",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;

  @ApiProperty({
    description: "Dữ liệu câu trả lời",
    example: { question1: "Câu trả lời 1", question2: "Câu trả lời 2" },
  })
  @IsObject()
  @IsNotEmpty()
  answers: any;

  @ApiProperty({
    description: "Tóm tắt AI (nếu có)",
    example: "Phản hồi tích cực về sản phẩm",
  })
  @IsString()
  @IsOptional()
  aiSummary?: string;
}
