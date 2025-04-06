import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Response } from "./entities/response.entity";
import { CreateResponseDto } from "./dto/create-response.dto";
import { Survey } from "../surveys/entities/survey.entity";
import { User } from "../users/entities/user.entity";
import { PaginatedResult, PaginationDto } from "../common/dto/pagination.dto";
import { AiService } from "../ai/ai.service";

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>
  ) {}

  async create(
    createResponseDto: CreateResponseDto,
    user?: User
  ): Promise<Response> {
    const { surveyId, answers } = createResponseDto;

    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId },
    });
    if (!survey) {
      throw new NotFoundException(`Không tìm thấy survey với ID ${surveyId}`);
    }

    const response = this.responsesRepository.create({
      answers,
      survey,
      user,
    });

    return this.responsesRepository.save(response);
  }

  async findAll(
    paginationDto: PaginationDto
  ): Promise<{ responses: Response[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [responses, total] = await this.responsesRepository.findAndCount({
      relations: ["survey", "user"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return { responses, total };
  }

  async findBySurvey(
    surveyId: string,
    paginationDto: PaginationDto
  ): Promise<{ responses: Response[]; total: number }> {
    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId },
    });
    if (!survey) {
      throw new NotFoundException(`Không tìm thấy survey với ID ${surveyId}`);
    }

    const [responses, total] = await this.responsesRepository.findAndCount({
      where: { survey: { id: surveyId } },
      relations: ["user"],
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { createdAt: "DESC" },
    });

    return { responses, total };
  }

  async findOne(id: string): Promise<Response> {
    const response = await this.responsesRepository.findOne({
      where: { id },
      relations: ["survey", "user"],
    });

    if (!response) {
      throw new NotFoundException(`Không tìm thấy response với ID ${id}`);
    }

    return response;
  }

  async remove(id: string): Promise<void> {
    const result = await this.responsesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy response với ID ${id}`);
    }
  }

  async findSurveyById(id: string): Promise<Survey | null> {
    return this.surveysRepository.findOne({
      where: { id },
    });
  }
}
