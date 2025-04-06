import { IsEmail, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Email của người dùng",
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Tên của người dùng", example: "Nguyễn Văn A" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "URL ảnh đại diện",
    example: "https:
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: "Tên nhà cung cấp xác thực",
    example: "google",
  })
  @IsString()
  provider: string;

  @ApiProperty({
    description: "ID của người dùng từ nhà cung cấp xác thực",
    example: "123456789",
  })
  @IsString()
  providerId: string;
}
