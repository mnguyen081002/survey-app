import { Controller, Get, UseGuards, Req, Res } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { BaseController } from "../common/controllers/base.controller";
import { User } from "../users/entities/user.entity";
import { ApiResponseDto } from "../common/dto/api-response.dto";
@ApiTags("auth")
@Controller("auth")
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Bắt đầu đăng nhập bằng Google" })
  googleAuth() {
    // Điểm khởi đầu đăng nhập Google OAuth
    // Passport sẽ xử lý redirect đến trang đăng nhập Google
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Callback từ Google OAuth" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Đăng nhập thất bại" })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    const loginResult = await this.authService.login(user);

    res.cookie("auth_token", loginResult.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
  }

  @Get("profile")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Lấy thông tin người dùng hiện tại" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Lấy thông tin thành công" })
  @ApiResponse({ status: 401, description: "Chưa xác thực" })
  async getProfile(@Req() req): Promise<ApiResponseDto<User>> {
    return this.success(req.user);
  }
}
