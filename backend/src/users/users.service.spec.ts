import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const mockUser = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  picture: "https:
  provider: "google",
  providerId: "123456789",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsers = [
  mockUser,
  {
    id: "2",
    email: "test2@example.com",
    name: "Test User 2",
    picture: "https:
    provider: "google",
    providerId: "987654321",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("UsersService", () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((user) =>
                Promise.resolve({ id: "1", ...user })
              ),
            find: jest.fn().mockResolvedValue(mockUsers),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should successfully create a user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        picture: "https:
        provider: "google",
        providerId: "123456789",
      };

      jest.spyOn(repo, "create").mockReturnValue(createUserDto as User);

      const result = await service.create(createUserDto);

      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({ id: "1", ...createUserDto });
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should find and return a user by id", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockUser as User);

      const result = await service.findById("1");

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("should throw a NotFoundException if user is not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      await expect(service.findById("999")).rejects.toThrow(NotFoundException);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "999" } });
    });
  });

  describe("findByEmail", () => {
    it("should find and return a user by email", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(mockUser as User);

      const result = await service.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if user with email not found", async () => {
      jest.spyOn(repo, "findOne").mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: "nonexistent@example.com" },
      });
    });
  });
});
