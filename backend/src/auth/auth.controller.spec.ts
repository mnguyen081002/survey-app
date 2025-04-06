import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../users/entities/user.entity";
import { BaseController } from "../common/controllers/base.controller";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: Partial<User> = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    picture: "https:
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: "test-jwt-token",
      user: mockUser,
    }),
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard("jwt"))
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(AuthGuard("google"))
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    
    process.env.FRONTEND_URL = "http:
    process.env.NODE_ENV = "development";
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("googleAuth", () => {
    it("should exist", () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe("googleAuthCallback", () => {
    it("should login user and set cookie", async () => {
      await controller.googleAuthCallback(mockRequest, mockResponse as any);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "auth_token",
        "test-jwt-token",
        {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24,
        }
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http:
      );
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual({
        message: "Thao tác thành công",
        data: mockUser,
      });
    });
  });
});
