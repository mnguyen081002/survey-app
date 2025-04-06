import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthGuard } from "@nestjs/passport";
import { SurveysController } from "../src/surveys/surveys.controller";
import { SurveysService } from "../src/surveys/surveys.service";
import { CreateSurveyDto } from "../src/surveys/dto/create-survey.dto";
import { Survey } from "../src/surveys/entities/survey.entity";
import { User } from "../src/users/entities/user.entity";
import { AppModule } from "../src/app.module";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as cookieParser from "cookie-parser";
import { AuthService } from "../src/auth/auth.service";
import { UsersService } from "../src/users/users.service";
import { randomUUID } from "crypto";

describe("Surveys E2E Tests", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let surveyRepository: Repository<Survey>;
  let userRepository: Repository<User>;
  let surveysService: SurveysService;
  let authService: AuthService;
  let userService: UsersService;
  let testUser: User;
  let testSurvey: Survey;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    app.use(cookieParser());

    await app.init();

    jwtService = app.get<JwtService>(JwtService);
    surveyRepository = app.get<Repository<Survey>>(getRepositoryToken(Survey));
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    surveysService = app.get<SurveysService>(SurveysService);
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);

    await setupTestData();
  });

  async function setupTestData() {
    testUser = userRepository.create({
      email: "survey-test@example.com",
      name: "Survey Test User",
      providerId: "survey-test-provider-id",
      provider: "google",
    });
    await userRepository.save(testUser);
    const user = await userService.create(testUser);
    const authResponse = await authService.login(user);
    authToken = authResponse.access_token;
  }

  afterAll(async () => {
    await app.close();
  });

  describe("POST /surveys", () => {
    it("should return 401 if user is not authenticated", () => {
      return request(app.getHttpServer()).post("/surveys").send({}).expect(401);
    });

    it("should create a new survey when authenticated", async () => {
      const createSurveyDto: CreateSurveyDto = {
        title: "New E2E Survey",
        description: "E2E Test Survey",
        questions: [{ type: "text", name: "q1", title: "E2E Question?" }],
        json: {
          pages: [
            {
              name: "page1",
              title: "",
              elements: [
                {
                  name: "q1",
                  type: "text",
                  title: "E2E Question?",
                },
              ],
            },
          ],
          title: "E2E Survey",
          headerView: "advanced",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/surveys")
        .set("Cookie", `auth_token=${authToken}`)
        .send(createSurveyDto)
        .expect(201);

      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(createSurveyDto.title);
      expect(response.body.message).toBe("Survey đã được tạo thành công");

      testSurvey = response.body.data;
    });

    it("should validate the input data", async () => {
      const invalidDto = {};

      return request(app.getHttpServer())
        .post("/surveys")
        .set("Cookie", `auth_token=${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe("GET /surveys/my-surveys", () => {
    it("should return user surveys when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get("/surveys/my-surveys")
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
      expect(response.body.message).toBe(
        "Lấy danh sách survey của bạn thành công"
      );

      const surveyIds = response.body.data.map((s) => s.id);
      expect(surveyIds).toContain(testSurvey.id);
    });
  });

  describe("GET /surveys/:id", () => {
    it("should return a survey by id", async () => {
      const response = await request(app.getHttpServer())
        .get(`/surveys/${testSurvey.id}`)
        .expect(200);

      expect(response.body.data.id).toBe(testSurvey.id);
      expect(response.body.data.title).toBe(testSurvey.title);
      expect(response.body.message).toBe("Lấy thông tin survey thành công");
    });

    it("should return 404 when survey not found", async () => {
      return request(app.getHttpServer())
        .get(`/surveys/${randomUUID()}`)
        .expect(404);
    });
  });

  describe("PATCH /surveys/:id", () => {
    it("should update a survey when authenticated", async () => {
      const updateDto = {
        title: "Updated Survey Title",
      };

      const response = await request(app.getHttpServer())
        .patch(`/surveys/${testSurvey.id}`)
        .set("Cookie", `auth_token=${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.title).toBe(updateDto.title);
      expect(response.body.message).toBe("Cập nhật survey thành công");

      const updatedSurvey = await surveyRepository.findOne({
        where: { id: testSurvey.id },
      });
      expect(updatedSurvey.title).toBe(updateDto.title);
    });

    it("should return 404 when updating survey of another user", async () => {
      const anotherUser = await userRepository.save(
        userRepository.create({
          email: "another-user@example.com",
          name: "Another User",
          providerId: "another-provider-id",
          provider: "google",
        })
      );

      const anotherUserAuth = await authService.login(
        await userService.create(anotherUser)
      );

      return request(app.getHttpServer())
        .patch(`/surveys/${testSurvey.id}`)
        .set("Cookie", `auth_token=${anotherUserAuth.access_token}`)
        .send({ title: "Unauthorized Update" })
        .expect(404);
    });
  });

  describe("DELETE /surveys/:id", () => {
    it("should create a new survey for delete test", async () => {
      const createSurveyDto: CreateSurveyDto = {
        title: "Survey To Delete",
        description: "This survey will be deleted",
        questions: [{ type: "text", name: "q1" }],
        json: {
          pages: [
            {
              name: "page1",
              elements: [{ type: "text", name: "q1" }],
            },
          ],
          title: "Survey To Delete",
          headerView: "advanced",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/surveys")
        .set("Cookie", `auth_token=${authToken}`)
        .send(createSurveyDto)
        .expect(201);

      const surveyToDelete = response.body.data;

      const createdSurvey = await surveyRepository.findOne({
        where: { id: surveyToDelete.id },
      });
      expect(createdSurvey).toBeDefined();

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/surveys/${surveyToDelete.id}`)
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();
      expect(deleteResponse.body.message).toBe("Xóa survey thành công");

      const deletedSurvey = await surveyRepository.findOne({
        where: { id: surveyToDelete.id },
      });
      expect(deletedSurvey).toBeNull();
    });
  });

  describe("GET /surveys/dashboard/stats", () => {
    it("should return dashboard statistics when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get("/surveys/dashboard/stats")
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("totalSurveys");
      expect(response.body.data).toHaveProperty("activeSurveys");
      expect(response.body.data).toHaveProperty("recentSurveys");
      expect(response.body.message).toBe("Lấy thống kê dashboard thành công");
    });
  });
});
