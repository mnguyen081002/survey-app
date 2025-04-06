import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString, IsUUID } from "class-validator";

export class GenerateSummaryDto {
  @ApiProperty({
    description: "ID của survey",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;
}
