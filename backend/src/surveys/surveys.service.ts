import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Like, Repository } from "typeorm";
import { Survey } from "./entities/survey.entity";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { User } from "../users/entities/user.entity";
import { PaginatedResult, PaginationDto } from "../common/dto/pagination.dto";
import { DashboardStatsDto, SurveyStatItem } from "./dto/dashboard-stats.dto";
import { Response } from "../responses/entities/response.entity";
import { GetListSurveyDto } from "./dto/get-list-survey.dto";

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>
  ) {}

  async create(
    createSurveyDto: CreateSurveyDto,
    creator: User
  ): Promise<Survey> {
    const survey = this.surveysRepository.create({
      ...createSurveyDto,
      creator,
    });
    return this.surveysRepository.save(survey);
  }

  async findAllByUser(
    userId: string,
    query: GetListSurveyDto
  ): Promise<{ data: Survey[]; total: number }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const [surveys, total] = await this.surveysRepository.findAndCount({
      where: {
        creator: { id: userId },
        title: search ? Like(`%${search}%`) : undefined,
      },
      relations: ["creator"],
      skip,
      take: limit,
      order: { updatedAt: "DESC" },
    });

    return { data: surveys, total };
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveysRepository.findOne({
      where: { id },
      relations: ["creator"],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async update(
    where: FindOptionsWhere<Survey>,
    updateSurveyDto: UpdateSurveyDto
  ): Promise<Survey> {
    const survey = await this.surveysRepository.findOne({ where });
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${where.id} not found`);
    }
    return this.surveysRepository.save({ ...survey, ...updateSurveyDto });
  }

  async remove(id: string): Promise<void> {
    const result = await this.surveysRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
  }

  async getDashboardStats(userId?: string): Promise<DashboardStatsDto> {
    const totalSurveysQuery =
      this.surveysRepository.createQueryBuilder("survey");
    if (userId) {
      totalSurveysQuery.where("survey.creator_id = :userId", { userId });
    }
    const totalSurveys = await totalSurveysQuery.getCount();

    const activeSurveysQuery = this.surveysRepository
      .createQueryBuilder("survey")
      .where("survey.isActive = true");
    if (userId) {
      activeSurveysQuery.andWhere("survey.creator_id = :userId", { userId });
    }
    const activeSurveys = await activeSurveysQuery.getCount();

    const totalResponsesQuery = this.responsesRepository
      .createQueryBuilder("response")
      .leftJoin("response.survey", "survey");
    if (userId) {
      totalResponsesQuery.where("survey.creator_id = :userId", { userId });
    }
    const totalResponses = await totalResponsesQuery.getCount();

    const completionRate =
      totalSurveys > 0 ? Math.round((activeSurveys / totalSurveys) * 100) : 0;

    const averageResponses =
      totalSurveys > 0 ? totalResponses / totalSurveys : 0;

    const recentSurveysQuery = this.surveysRepository
      .createQueryBuilder("survey")
      .leftJoinAndSelect("survey.responses", "response")
      .select([
        "survey.id",
        "survey.title",
        "survey.description",
        "survey.isActive",
        "survey.createdAt",
      ])
      .addSelect("COUNT(response.id)", "responseCount");

    if (userId) {
      recentSurveysQuery.where("survey.creator_id = :userId", { userId });
    }

    const recentSurveysRaw = await recentSurveysQuery
      .groupBy("survey.id")
      .orderBy("survey.createdAt", "DESC")
      .limit(5)
      .getRawAndEntities();

    const recentSurveys: SurveyStatItem[] = recentSurveysRaw.entities.map(
      (survey, index) => {
        const rawItem = recentSurveysRaw.raw[index];
        return {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          responseCount: parseInt(rawItem.responseCount) || 0,
          status: survey.isActive ? "active" : "inactive",
          createdAt: survey.createdAt,
        };
      }
    );

    return {
      totalSurveys,
      activeSurveys,
      totalResponses,
      averageResponses,
      completionRate,
      recentSurveys,
    };
  }
}
