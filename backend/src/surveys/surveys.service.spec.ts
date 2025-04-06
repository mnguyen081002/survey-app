import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { SurveysService } from "./surveys.service";
import { Survey } from "./entities/survey.entity";
import { Response } from "../responses/entities/response.entity";
import { User } from "../users/entities/user.entity";
import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";

describe("SurveysService", () => {
  let service: SurveysService;
  let surveyRepository: Repository<Survey>;
  let responseRepository: Repository<Response>;

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
    json: {
      title: "Test Survey",
      questions: [{ type: "text", name: "q1", title: "Question 1?" }],
    },
    isActive: true,
    creator: mockUser as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSurveys = [
    mockSurvey,
    {
      ...mockSurvey,
      id: "survey2",
      title: "Another Survey",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: getRepositoryToken(Survey),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getCount: jest.fn(),
              getRawAndEntities: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Response),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getCount: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    surveyRepository = module.get<Repository<Survey>>(
      getRepositoryToken(Survey)
    );
    responseRepository = module.get<Repository<Response>>(
      getRepositoryToken(Response)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new survey", async () => {
      const createSurveyDto: CreateSurveyDto = {
        title: "New Survey",
        description: "Survey Description",
        questions: [{ type: "text", name: "q1", title: "Question?" }],
        json: {
          title: "New Survey",
          questions: [{ type: "text", name: "q1", title: "Question?" }],
        },
        isActive: true,
      };
      const expectedSurvey = {
        ...createSurveyDto,
        creator: mockUser,
        id: "newId",
      };

      jest
        .spyOn(surveyRepository, "create")
        .mockReturnValue(expectedSurvey as Survey);
      jest
        .spyOn(surveyRepository, "save")
        .mockResolvedValue(expectedSurvey as Survey);

      const result = await service.create(createSurveyDto, mockUser as User);

      expect(surveyRepository.create).toHaveBeenCalledWith({
        ...createSurveyDto,
        creator: mockUser,
      });
      expect(surveyRepository.save).toHaveBeenCalledWith(expectedSurvey);
      expect(result).toEqual(expectedSurvey);
    });
  });

  describe("findAllByUser", () => {
    it("should return surveys for a specific user with pagination", async () => {
      const userId = "user1";
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        data: mockSurveys as Survey[],
        total: 2,
      };

      jest
        .spyOn(surveyRepository, "findAndCount")
        .mockResolvedValue([mockSurveys as Survey[], 2]);

      const result = await service.findAllByUser(userId, query);

      expect(surveyRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          creator: { id: userId },
          title: undefined,
        },
        relations: ["creator"],
        skip: 0,
        take: 10,
        order: { updatedAt: "DESC" },
      });
      expect(result).toEqual(expectedResult);
    });

    it("should apply search filter when provided", async () => {
      const userId = "user1";
      const query = { page: 1, limit: 10, search: "test" };

      jest
        .spyOn(surveyRepository, "findAndCount")
        .mockResolvedValue([mockSurveys as Survey[], 2]);

      await service.findAllByUser(userId, query);

      expect(surveyRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.anything(),
          }),
        })
      );
    });
  });

  describe("findOne", () => {
    it("should return a survey by id", async () => {
      jest
        .spyOn(surveyRepository, "findOne")
        .mockResolvedValue(mockSurvey as Survey);

      const result = await service.findOne("survey1");

      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "survey1" },
        relations: ["creator"],
      });
      expect(result).toEqual(mockSurvey);
    });

    it("should throw NotFoundException if survey not found", async () => {
      jest.spyOn(surveyRepository, "findOne").mockResolvedValue(null);

      await expect(service.findOne("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(surveyRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonExistentId" },
        relations: ["creator"],
      });
    });
  });

  describe("update", () => {
    it("should update a survey", async () => {
      const updateSurveyDto: UpdateSurveyDto = {
        title: "Updated Title",
        isActive: false,
      };
      const updatedSurvey = { ...mockSurvey, ...updateSurveyDto };

      jest
        .spyOn(service, "findOne")
        .mockResolvedValueOnce(mockSurvey as Survey);
      jest
        .spyOn(surveyRepository, "update")
        .mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      jest
        .spyOn(service, "findOne")
        .mockResolvedValueOnce(updatedSurvey as Survey);

      const result = await service.update("survey1", updateSurveyDto);

      expect(service.findOne).toHaveBeenCalledTimes(2);
      expect(surveyRepository.update).toHaveBeenCalledWith(
        "survey1",
        updateSurveyDto
      );
      expect(result).toEqual(updatedSurvey);
    });
  });

  describe("remove", () => {
    it("should delete a survey", async () => {
      jest
        .spyOn(surveyRepository, "delete")
        .mockResolvedValue({ affected: 1, raw: {} });

      await service.remove("survey1");

      expect(surveyRepository.delete).toHaveBeenCalledWith("survey1");
    });

    it("should throw NotFoundException if survey not found during deletion", async () => {
      jest
        .spyOn(surveyRepository, "delete")
        .mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(surveyRepository.delete).toHaveBeenCalledWith("nonExistentId");
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics for a user", async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: [
            {
              id: "survey1",
              title: "Survey 1",
              description: "Desc 1",
              isActive: true,
              createdAt: new Date(),
            },
            {
              id: "survey2",
              title: "Survey 2",
              description: "Desc 2",
              isActive: false,
              createdAt: new Date(),
            },
          ],
          raw: [{ responseCount: "5" }, { responseCount: "3" }],
        }),
      };

      jest
        .spyOn(surveyRepository, "createQueryBuilder")
        .mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(responseRepository, "createQueryBuilder").mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(8),
      } as any);

      const result = await service.getDashboardStats("user1");

      expect(result).toEqual({
        totalSurveys: 10,
        activeSurveys: 10,
        totalResponses: 8,
        averageResponses: 0.8,
        completionRate: 100,
        recentSurveys: expect.arrayContaining([
          expect.objectContaining({
            id: "survey1",
            title: "Survey 1",
            responseCount: 5,
          }),
          expect.objectContaining({
            id: "survey2",
            title: "Survey 2",
            responseCount: 3,
          }),
        ]),
      });
    });
  });
});
