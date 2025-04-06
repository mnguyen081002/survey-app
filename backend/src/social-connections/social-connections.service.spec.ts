import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SocialConnectionsService } from "./social-connections.service";
import { SocialConnection } from "./entities/social_connections.entity";
import { User } from "../users/entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateSocialConnectionDto } from "./dto/create-social-connection.dto";

describe("SocialConnectionsService", () => {
  let service: SocialConnectionsService;
  let repository: Repository<SocialConnection>;

  const mockUser: Partial<User> = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
  };

  const mockSocialConnection: Partial<SocialConnection> = {
    id: "test-connection-id",
    provider: "google",
    providerId: "123456789",
    user: mockUser as User,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialConnectionsService,
        {
          provide: getRepositoryToken(SocialConnection),
          useValue: {
            create: jest.fn().mockReturnValue(mockSocialConnection),
            save: jest.fn().mockResolvedValue(mockSocialConnection),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SocialConnectionsService>(SocialConnectionsService);
    repository = module.get<Repository<SocialConnection>>(
      getRepositoryToken(SocialConnection)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new social connection", async () => {
      const createDto: CreateSocialConnectionDto = {
        provider: "google",
        providerId: "123456789",
        user: mockUser as User,
      };

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockSocialConnection);
      expect(result).toEqual(mockSocialConnection);
    });
  });

  describe("findByProviderAndProviderId", () => {
    it("should find a connection by provider and providerId", async () => {
      jest
        .spyOn(repository, "findOne")
        .mockResolvedValue(mockSocialConnection as SocialConnection);
      const provider = "google";
      const providerId = "123456789";

      const result = await service.findByProviderAndProviderId(
        provider,
        providerId
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { provider, providerId },
        relations: ["user"],
      });
      expect(result).toEqual(mockSocialConnection);
    });

    it("should return null if connection not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValue(null);
      const provider = "unknown";
      const providerId = "unknown-id";

      const result = await service.findByProviderAndProviderId(
        provider,
        providerId
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { provider, providerId },
        relations: ["user"],
      });
      expect(result).toBeNull();
    });
  });
});
