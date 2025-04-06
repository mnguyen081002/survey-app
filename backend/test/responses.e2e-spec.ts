import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "../src/responses/entities/response.entity";
import { User } from "../src/users/entities/user.entity";
import { Survey } from "../src/surveys/entities/survey.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { CreateResponseDto } from "../src/responses/dto/create-response.dto";
import { UsersModule } from "src/users/users.module";
import { ResponsesModule } from "src/responses/responses.module";
import { SurveysModule } from "src/surveys/surveys.module";
import { AuthModule } from "src/auth/auth.module";
import { CreateSurveyDto } from "src/surveys/dto/create-survey.dto";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import * as cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
describe("Responses E2E Tests", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let responseRepository: Repository<Response>;
  let userRepository: Repository<User>;
  let surveyRepository: Repository<Survey>;
  let authService: AuthService;
  let userService: UsersService;
  let testUser: User;
  let testSurvey: Survey;
  let testResponse: Response;
  let authToken: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    app.use(cookieParser());

    await app.init();

    jwtService = app.get<JwtService>(JwtService);
    responseRepository = app.get<Repository<Response>>(
      getRepositoryToken(Response)
    );
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    surveyRepository = app.get<Repository<Survey>>(getRepositoryToken(Survey));
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
    await setupTestData();
  });

  
  async function setupTestData() {
    
    testUser = userRepository.create({
      email: "test@example.com",
      name: "Test User",
      providerId: "test-provider-id",
      provider: "google",
    });
    await userRepository.save(testUser);
    const user = await userService.create(testUser);
    const authResponse = await authService.login(user);
    authToken = authResponse.access_token;
    const createSurveyDto: CreateSurveyDto = {
      title: "Test Survey",
      description: "A survey for testing purposes",
      questions: [{ type: "text", name: "question1" }],
      json: {
        pages: [
          {
            name: "page1",
            title: "",
            elements: [
              {
                name: "question1",
                type: "text",
              },
            ],
          },
        ],
        title: "Test",
        headerView: "advanced",
      },
    };

    const response = await request(app.getHttpServer())
      .post("/surveys")
      .set("Cookie", `auth_token=${authToken}`)
      .send(createSurveyDto)
      .expect(201);

    testSurvey = response.body.data;
  }

  afterAll(async () => {
    await app.close();
  });

  describe("POST /responses", () => {
    it("should create a response without authentication", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: testSurvey.id,
        answers: { question1: "Anonymous User" },
        aiSummary: "User provided positive feedback",
      };

      const response = await request(app.getHttpServer())
        .post("/responses")
        .send(createResponseDto)
        .expect(201);

      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.answers).toEqual(createResponseDto.answers);
      expect(response.body.data.aiSummary).toEqual(createResponseDto.aiSummary);
      expect(response.body.data.user).toBeNull();

      const responseId = response.body.data.id;
      const savedResponse = await responseRepository.findOne({
        where: { id: responseId },
        relations: ["survey", "user"],
      });

      expect(savedResponse).toBeDefined();
      expect(savedResponse.answers).toEqual(createResponseDto.answers);
      expect(savedResponse.survey.id).toEqual(testSurvey.id);
      expect(savedResponse.user).toBeNull();
    });

    it("should create a response with authenticated user", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: testSurvey.id,
        answers: { q1: "Authenticated User", q2: "This is great!" },
        aiSummary: "User is satisfied",
      };

      const response = await request(app.getHttpServer())
        .post("/responses")
        .set("Cookie", `auth_token=${authToken}`)
        .send(createResponseDto)
        .expect(201);

      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.answers).toEqual(createResponseDto.answers);

      
      testResponse = await responseRepository.findOne({
        where: { id: response.body.data.id },
        relations: ["survey", "user"],
      });

      expect(testResponse).toBeDefined();
    });

    it("should validate input and reject invalid data", async () => {
      
      const invalidDto = {
        answers: { q1: "Invalid Answer" },
      };

      return request(app.getHttpServer())
        .post("/responses")
        .send(invalidDto)
        .expect(400);
    });

    it("should reject survey that doesn't exist", async () => {
      const createResponseDto: CreateResponseDto = {
        surveyId: randomUUID(),
        answers: { q1: "Test Answer" },
      };

      return request(app.getHttpServer())
        .post("/responses")
        .send(createResponseDto)
        .expect(404);
    });
  });

  describe("GET /responses", () => {
    it("should require authentication", () => {
      return request(app.getHttpServer()).get("/responses").expect(401);
    });

    it("should return all responses when authenticated", async () => {
      const response = await request(app.getHttpServer())
        .get("/responses")
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("page", 1);
      expect(response.body.meta).toHaveProperty("limit", 10);

      
      const responseIds = response.body.data.map((r) => r.id);
      expect(responseIds).toContain(testResponse.id);
    });

    it("should handle pagination", async () => {
      
      for (let i = 0; i < 5; i++) {
        await responseRepository.save(
          responseRepository.create({
            answers: {
              q1: `Pagination test ${i}`,
              q2: "Answer for pagination",
            },
            survey: testSurvey,
            user: testUser,
          })
        );
      }

      const response = await request(app.getHttpServer())
        .get("/responses?page=1&limit=3")
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(3);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(6); 

      
      const response2 = await request(app.getHttpServer())
        .get("/responses?page=2&limit=3")
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(response2.body.data).toBeInstanceOf(Array);
      expect(response2.body.meta.page).toBe(2);

      
      const page1Ids = response.body.data.map((r) => r.id);
      const page2Ids = response2.body.data.map((r) => r.id);
      const hasOverlap = page1Ids.some((id) => page2Ids.includes(id));
      expect(hasOverlap).toBe(false);
    });
  });

  describe("DELETE /responses/:id", () => {
    it("should require authentication", () => {
      return request(app.getHttpServer())
        .delete(`/responses/${testResponse.id}`)
        .expect(401);
    });

    it("should delete a response when authenticated", async () => {
      
      const createResponseDto: CreateResponseDto = {
        surveyId: testSurvey.id,
        answers: { q1: "Response To Delete", q2: "This will be deleted" },
      };

      const createResult = await request(app.getHttpServer())
        .post("/responses")
        .set("Cookie", `auth_token=${authToken}`)
        .send(createResponseDto)
        .expect(201);

      const responseIdToDelete = createResult.body.data.id;

      
      const responseBeforeDelete = await responseRepository.findOne({
        where: { id: responseIdToDelete },
      });
      expect(responseBeforeDelete).toBeDefined();

      
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/responses/${responseIdToDelete}`)
        .set("Cookie", `auth_token=${authToken}`)
        .expect(200);

      expect(deleteResponse.body.data).toBeNull();
      expect(deleteResponse.body.message).toBeDefined();

      
      const responseAfterDelete = await responseRepository.findOne({
        where: { id: responseIdToDelete },
      });
      expect(responseAfterDelete).toBeNull();
    });

    it("should return 404 when deleting non-existent response", async () => {
      return request(app.getHttpServer())
        .delete(`/responses/${randomUUID()}`)
        .set("Cookie", `auth_token=${authToken}`)
        .expect(404);
    });
  });
});
