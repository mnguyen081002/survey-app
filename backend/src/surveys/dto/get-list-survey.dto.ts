import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class GetListSurveyDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;
}
