import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import * as cookieParser from "cookie-parser";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "../src/auth/auth.service";
import { AuthController } from "../src/auth/auth.controller";
import { UsersService } from "../src/users/users.service";
import { SocialConnectionsService } from "../src/social-connections/social-connections.service";
import { User } from "../src/users/entities/user.entity";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../src/auth/strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

describe("Auth E2E Tests", () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

  
  const mockUser: Partial<User> = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    picture: "https:
    provider: "google",
    providerId: "123456789",
  };

  beforeAll(async () => {
    
    process.env.JWT_SECRET = "test-secret-key";
    process.env.JWT_EXPIRATION = "3600";
    process.env.FRONTEND_URL = "http:

    const mockUsersService = {
      findById: jest.fn().mockResolvedValue(mockUser),
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
    };

    const mockSocialConnectionsService = {
      findByProviderAndProviderId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ user: mockUser }),
    };

    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get("JWT_SECRET"),
            signOptions: {
              expiresIn: Number(configService.get("JWT_EXPIRATION")),
            },
          }),
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SocialConnectionsService,
          useValue: mockSocialConnectionsService,
        },
      ],
    })
      .overrideGuard(AuthGuard("jwt"))
      .useValue({
        canActivate: jest.fn().mockImplementation((context) => {
          const req = context.switchToHttp().getRequest();
          const auth = req.headers.authorization;

          if (!auth) return false;

          const token = auth.split(" ")[1];
          try {
            req.user = mockUser;
            return true;
          } catch (e) {
            return false;
          }
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );
    app.use(cookieParser());

    
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  
  describe("GET /auth/profile", () => {
    it("should return 403 if no token is provided", () => {
      return request(app.getHttpServer()).get("/auth/profile").expect(403);
    });

    it("should return user profile if valid token is provided", async () => {
      
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };
      const token = jwtService.sign(payload);

      const response = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        })
      );
    });
  });
});
