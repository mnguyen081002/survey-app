import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { User } from "../../users/entities/user.entity";

export class CreateSocialConnectionDto {
  @ApiProperty({
    description: "Provider name, e.g. google, github",
    example: "google",
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: "Provider unique ID for the user",
    example: "123456789",
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    description: "Access token from OAuth provider",
    required: false,
  })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({
    description: "Refresh token from OAuth provider",
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;

  @ApiProperty({ description: "User this connection belongs to" })
  @IsNotEmpty()
  user: User;
}
