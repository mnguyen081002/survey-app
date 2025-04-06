import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ResponsesService } from "./responses.service";
import { Response } from "./entities/response.entity";
import { Survey } from "../surveys/entities/survey.entity";
import { User } from "../users/entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateResponseDto } from "./dto/create-response.dto";

describe("ResponsesService", () => {
  let service: ResponsesService;
  let responseRepository: Repository<Response>;
  let surveyRepository: Repository<Survey>;

  const mockUser: Partial<User> = {
    id: "user1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockSurvey: Partial<Survey> = {
    id: "survey1",
    title: "Test Survey",
    description: "Test Description",
    questions: [{ type: "text", name: "q1", title: "Question 1?" }],
    isActive: true,
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
      providers: [
        ResponsesService,
        {
          provide: getRepositoryToken(Response),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Survey),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResponsesService>(ResponsesService);
    responseRepository = module.get<Repository<Response>>(
      getRepositoryToken(Response)
    );
    surveyRepository = module.get<Repository<Survey>>(
      getRepositoryToken(Survey)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a response for an existing survey", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: "survey1",
        answers: { q1: "Test Answer" },
        aiSummary: "AI Generated Summary",
      };

      jest
        .spyOn(surveyRepository, "findOne")
        .mockResolvedValue(mockSurvey as Survey);

      const createdResponse = {
        id: "newId",
        answers: createResponseDto.answers,
        aiSummary: createResponseDto.aiSummary,
        survey: mockSurvey,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Response;

      jest.spyOn(responseRepository, "create").mockReturnValue(createdResponse);
      jest.spyOn(responseRepository, "save").mockResolvedValue(createdResponse);

      const result = await service.create(createResponseDto, mockUser as User);

      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "survey1" },
      });
      expect(responseRepository.create).toHaveBeenCalledWith({
        answers: createResponseDto.answers,
        aiSummary: createResponseDto.aiSummary,
        survey: mockSurvey,
        user: mockUser,
      });
      expect(responseRepository.save).toHaveBeenCalledWith(createdResponse);
      expect(result).toEqual(createdResponse);
    });

    it("should throw NotFoundException when survey does not exist", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: "nonexistentSurvey",
        answers: { q1: "Test Answer" },
      };

      jest.spyOn(surveyRepository, "findOne").mockResolvedValue(null);

      await expect(
        service.create(createResponseDto, mockUser as User)
      ).rejects.toThrow(NotFoundException);
      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonexistentSurvey" },
      });
    });
  });

  describe("findAll", () => {
    it("should return paginated responses", async () => {
      const paginationDto = { page: 1, limit: 10 };
      const total = 2;

      jest
        .spyOn(responseRepository, "findAndCount")
        .mockResolvedValue([mockResponses as Response[], total]);

      const result = await service.findAll(paginationDto);

      expect(responseRepository.findAndCount).toHaveBeenCalledWith({
        relations: ["survey", "user"],
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result.responses).toEqual(mockResponses);
      expect(result.total).toEqual(total);
    });
  });

  describe("findBySurvey", () => {
    it("should return paginated responses for a specific survey", async () => {
      const surveyId = "survey1";
      const paginationDto = { page: 1, limit: 10 };
      const total = 2;

      jest
        .spyOn(surveyRepository, "findOne")
        .mockResolvedValue(mockSurvey as Survey);
      jest
        .spyOn(responseRepository, "findAndCount")
        .mockResolvedValue([mockResponses as Response[], total]);

      const result = await service.findBySurvey(surveyId, paginationDto);

      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: surveyId },
      });
      expect(responseRepository.findAndCount).toHaveBeenCalledWith({
        where: { survey: { id: surveyId } },
        relations: ["user"],
        skip: 0,
        take: 10,
        order: { createdAt: "DESC" },
      });
      expect(result.responses).toEqual(mockResponses);
      expect(result.total).toEqual(total);
    });

    it("should throw NotFoundException when survey does not exist", async () => {
      const surveyId = "nonexistentSurvey";
      const paginationDto = { page: 1, limit: 10 };

      jest.spyOn(surveyRepository, "findOne").mockResolvedValue(null);

      await expect(
        service.findBySurvey(surveyId, paginationDto)
      ).rejects.toThrow(NotFoundException);
      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: surveyId },
      });
    });
  });

  describe("findOne", () => {
    it("should return a response by id", async () => {
      jest
        .spyOn(responseRepository, "findOne")
        .mockResolvedValue(mockResponse as Response);

      const result = await service.findOne("response1");

      expect(responseRepository.findOne).toHaveBeenCalledWith({
        where: { id: "response1" },
        relations: ["survey", "user"],
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw NotFoundException if response not found", async () => {
      jest.spyOn(responseRepository, "findOne").mockResolvedValue(null);

      await expect(service.findOne("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(responseRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonExistentId" },
        relations: ["survey", "user"],
      });
    });
  });

  describe("remove", () => {
    it("should delete a response", async () => {
      jest
        .spyOn(responseRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: {} });

      await service.remove("response1");

      expect(responseRepository.delete).toHaveBeenCalledWith("response1");
    });

    it("should throw NotFoundException if response not found during deletion", async () => {
      jest
        .spyOn(responseRepository, "delete")
        .mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(responseRepository.delete).toHaveBeenCalledWith("nonExistentId");
    });
  });
});
