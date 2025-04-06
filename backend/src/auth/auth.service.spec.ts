import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { SocialConnectionsService } from "../social-connections/social-connections.service";
import { User } from "../users/entities/user.entity";
import { SocialConnection } from "../social-connections/entities/social_connections.entity";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let socialConnectionsService: SocialConnectionsService;

  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    picture: "https:
    provider: "google",
    providerId: "123456789",
  } as User;

  const mockConnection = {
    id: "test-connection-id",
    provider: "google",
    providerId: "123456789",
    user: mockUser,
  } as SocialConnection;

  const mockProfile = {
    email: "test@example.com",
    name: "Test User",
    picture: "https:
    provider: "google",
    providerId: "123456789",
  };

  const mockAccessToken = "test-jwt-token";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockAccessToken),
          },
        },
        {
          provide: SocialConnectionsService,
          useValue: {
            findByProviderAndProviderId: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    socialConnectionsService = module.get<SocialConnectionsService>(
      SocialConnectionsService
    );
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("login", () => {
    it("should return access token and user info", async () => {
      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });

      expect(result).toEqual({
        access_token: mockAccessToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          picture: mockUser.picture,
        },
      });
    });
  });

  describe("validateSocialUser", () => {
    it("should return existing user if connection exists", async () => {
      jest
        .spyOn(socialConnectionsService, "findByProviderAndProviderId")
        .mockResolvedValue(mockConnection);

      const result = await authService.validateSocialUser(mockProfile);

      expect(
        socialConnectionsService.findByProviderAndProviderId
      ).toHaveBeenCalledWith(mockProfile.provider, mockProfile.providerId);
      expect(result).toEqual(mockUser);
    });

    it("should return existing user if email exists but no connection", async () => {
      jest
        .spyOn(socialConnectionsService, "findByProviderAndProviderId")
        .mockResolvedValue(null);
      jest.spyOn(usersService, "findByEmail").mockResolvedValue(mockUser);
      jest
        .spyOn(socialConnectionsService, "create")
        .mockResolvedValue(mockConnection);

      const result = await authService.validateSocialUser(mockProfile);

      expect(
        socialConnectionsService.findByProviderAndProviderId
      ).toHaveBeenCalledWith(mockProfile.provider, mockProfile.providerId);
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockProfile.email);
      expect(socialConnectionsService.create).toHaveBeenCalledWith({
        provider: mockProfile.provider,
        providerId: mockProfile.providerId,
        user: mockUser,
      });
      expect(result).toEqual(mockUser);
    });

    it("should create new user if email does not exist", async () => {
      jest
        .spyOn(socialConnectionsService, "findByProviderAndProviderId")
        .mockResolvedValue(null);
      jest.spyOn(usersService, "findByEmail").mockResolvedValue(null);
      jest.spyOn(usersService, "create").mockResolvedValue(mockUser);
      jest
        .spyOn(socialConnectionsService, "create")
        .mockResolvedValue(mockConnection);

      const result = await authService.validateSocialUser(mockProfile);

      expect(
        socialConnectionsService.findByProviderAndProviderId
      ).toHaveBeenCalledWith(mockProfile.provider, mockProfile.providerId);
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockProfile.email);
      expect(usersService.create).toHaveBeenCalledWith({
        email: mockProfile.email,
        name: mockProfile.name,
        picture: mockProfile.picture,
        provider: mockProfile.provider,
        providerId: mockProfile.providerId,
      });
      expect(socialConnectionsService.create).toHaveBeenCalledWith({
        provider: mockProfile.provider,
        providerId: mockProfile.providerId,
        user: mockUser,
      });
      expect(result).toEqual(mockUser);
    });
  });
});
