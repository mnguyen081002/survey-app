import { Test, TestingModule } from "@nestjs/testing";
import { ResponsesController } from "./responses.controller";
import { ResponsesService } from "./responses.service";
import { Response } from "./entities/response.entity";
import { User } from "../users/entities/user.entity";
import { Survey } from "../surveys/entities/survey.entity";
import { CreateResponseDto } from "./dto/create-response.dto";
import { NotFoundException } from "@nestjs/common";

describe("ResponsesController", () => {
  let controller: ResponsesController;
  let service: ResponsesService;

  const mockUser: Partial<User> = {
    id: "user1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockSurvey: Partial<Survey> = {
    id: "survey1",
    title: "Test Survey",
    description: "Test Description",
  };

  const mockResponse: Partial<Response> = {
    id: "response1",
    answers: { q1: "Answer to question 1" },
    aiSummary: "AI Summary",
    survey: mockSurvey as Survey,
    user: mockUser as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponses = [
    mockResponse,
    {
      ...mockResponse,
      id: "response2",
      answers: { q1: "Different answer" },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsesController],
      providers: [
        {
          provide: ResponsesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findBySurvey: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ResponsesController>(ResponsesController);
    service = module.get<ResponsesService>(ResponsesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new response", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: "survey1",
        answers: { q1: "Test Answer" },
        aiSummary: "AI Generated Summary",
      };
      const req = { user: mockUser };
      const createdResponse = {
        id: "newId",
        answers: createResponseDto.answers,
        aiSummary: createResponseDto.aiSummary,
        survey: mockSurvey,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Response;

      jest.spyOn(service, "create").mockResolvedValue(createdResponse);

      const result = await controller.create(createResponseDto, req);

      expect(service.create).toHaveBeenCalledWith(createResponseDto, mockUser);
      expect(result.data).toEqual(createdResponse);
      expect(result.message).toBeDefined();
    });

    it("should create a response with no user when not authenticated", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: "survey1",
        answers: { q1: "Test Answer" },
      };
      const req = {}; 
      const createdResponse = {
        id: "newId",
        answers: createResponseDto.answers,
        survey: mockSurvey,
        user: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Response;

      jest.spyOn(service, "create").mockResolvedValue(createdResponse);

      const result = await controller.create(createResponseDto, req);

      expect(service.create).toHaveBeenCalledWith(createResponseDto, null);
      expect(result.data).toEqual(createdResponse);
      expect(result.message).toBeDefined();
    });
  });

  describe("findAll", () => {
    it("should return all responses with pagination", async () => {
      const paginationDto = { page: 1, limit: 10 };

      jest.spyOn(service, "findAll").mockResolvedValue({
        responses: mockResponses as Response[],
        total: mockResponses.length,
      });

      const result = await controller.findAll(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual({
        message: expect.any(String),
        data: mockResponses as Response[],
        meta: {
          total: mockResponses.length,
          page: paginationDto.page,
          limit: paginationDto.limit,
          totalPages: Math.ceil(mockResponses.length / paginationDto.limit),
        },
      });
    });
  });

  describe("remove", () => {
    it("should remove a response", async () => {
      jest.spyOn(service, "remove").mockResolvedValue(undefined);

      const result = await controller.remove("response1");

      expect(service.remove).toHaveBeenCalledWith("response1");
      expect(result.data).toBeNull();
      expect(result.message).toBeDefined();
    });

    it("should throw NotFoundException when removing non-existent response", async () => {
      jest.spyOn(service, "remove").mockRejectedValue(new NotFoundException());

      await expect(controller.remove("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith("nonExistentId");
    });
  });
});
