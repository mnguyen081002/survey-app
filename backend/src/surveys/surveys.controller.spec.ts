import { Test, TestingModule } from "@nestjs/testing";
import { SurveysController } from "./surveys.controller";
import { SurveysService } from "./surveys.service";
import { Survey } from "./entities/survey.entity";
import { User } from "../users/entities/user.entity";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { NotFoundException } from "@nestjs/common";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";

describe("SurveysController", () => {
  let controller: SurveysController;
  let service: SurveysService;

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
      controllers: [SurveysController],
      providers: [
        {
          provide: SurveysService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            findActiveOnes: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getDashboardStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    service = module.get<SurveysService>(SurveysService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
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
      const req = { user: mockUser };
      const createdSurvey = {
        ...createSurveyDto,
        id: "newId",
        creator: mockUser,
      };

      jest.spyOn(service, "create").mockResolvedValue(createdSurvey as Survey);

      const result = await controller.create(createSurveyDto, req);

      expect(service.create).toHaveBeenCalledWith(createSurveyDto, mockUser);
      expect(result.data).toEqual(createdSurvey);
      expect(result.message).toBe("Survey đã được tạo thành công");
    });
  });

  describe("findMyOnes", () => {
    it("should return surveys for the current user with pagination", async () => {
      const req = { user: { id: "user1" } };
      const query = { page: 1, limit: 10 };
      const serviceResponse = {
        data: mockSurveys as Survey[],
        total: mockSurveys.length,
      };

      jest.spyOn(service, "findAllByUser").mockResolvedValue(serviceResponse);

      const result = await controller.findMyOnes(req, query);

      expect(service.findAllByUser).toHaveBeenCalledWith("user1", query);
      expect(result.data).toEqual(mockSurveys);
      expect(result.meta.total).toEqual(mockSurveys.length);
      expect(result.message).toBe("Lấy danh sách survey của bạn thành công");
    });
  });

  describe("findOne", () => {
    it("should return a survey by id", async () => {
      jest.spyOn(service, "findOne").mockResolvedValue(mockSurvey as Survey);

      const result = await controller.findOne("survey1");

      expect(service.findOne).toHaveBeenCalledWith("survey1");
      expect(result.data).toEqual(mockSurvey);
      expect(result.message).toBe("Lấy thông tin survey thành công");
    });

    it("should throw NotFoundException when survey not found", async () => {
      jest.spyOn(service, "findOne").mockRejectedValue(new NotFoundException());

      await expect(controller.findOne("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(service.findOne).toHaveBeenCalledWith("nonExistentId");
    });
  });

  describe("update", () => {
    it("should update a survey", async () => {
      const updateSurveyDto: UpdateSurveyDto = {
        title: "Updated Title",
        isActive: false,
      };
      const updatedSurvey = { ...mockSurvey, ...updateSurveyDto };

      jest.spyOn(service, "update").mockResolvedValue(updatedSurvey as Survey);

      const result = await controller.update("survey1", updateSurveyDto);

      expect(service.update).toHaveBeenCalledWith("survey1", updateSurveyDto);
      expect(result.data).toEqual(updatedSurvey);
      expect(result.message).toBe("Cập nhật survey thành công");
    });

    it("should throw NotFoundException when updating non-existent survey", async () => {
      const updateSurveyDto: UpdateSurveyDto = {
        title: "Updated Title",
      };
      jest.spyOn(service, "update").mockRejectedValue(new NotFoundException());

      await expect(
        controller.update("nonExistentId", updateSurveyDto)
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(
        "nonExistentId",
        updateSurveyDto
      );
    });
  });

  describe("remove", () => {
    it("should remove a survey", async () => {
      jest.spyOn(service, "remove").mockResolvedValue(undefined);

      const result = await controller.remove("survey1");

      expect(service.remove).toHaveBeenCalledWith("survey1");
      expect(result.data).toBeNull();
      expect(result.message).toBe("Xóa survey thành công");
    });

    it("should throw NotFoundException when removing non-existent survey", async () => {
      jest.spyOn(service, "remove").mockRejectedValue(new NotFoundException());

      await expect(controller.remove("nonExistentId")).rejects.toThrow(
        NotFoundException
      );
      expect(service.remove).toHaveBeenCalledWith("nonExistentId");
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics for the current user", async () => {
      const req = { user: { id: "user1" } };
      const mockStats: DashboardStatsDto = {
        totalSurveys: 10,
        activeSurveys: 5,
        totalResponses: 20,
        averageResponses: 2,
        completionRate: 50,
        recentSurveys: [
          {
            id: "survey1",
            title: "Recent Survey 1",
            description: "Desc 1",
            responseCount: 5,
            status: "active",
            createdAt: new Date(),
          },
        ],
      };

      jest.spyOn(service, "getDashboardStats").mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats(req);

      expect(service.getDashboardStats).toHaveBeenCalledWith("user1");
      expect(result.data).toEqual(mockStats);
      expect(result.message).toBe("Lấy thống kê dashboard thành công");
    });
  });
});
