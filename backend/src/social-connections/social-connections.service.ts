import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SocialConnection } from "./entities/social_connections.entity";
import { CreateSocialConnectionDto } from "./dto/create-social-connection.dto";

@Injectable()
export class SocialConnectionsService {
  constructor(
    @InjectRepository(SocialConnection)
    private readonly socialConnectionsRepository: Repository<SocialConnection>
  ) {}

  async create(
    createSocialConnectionDto: CreateSocialConnectionDto
  ): Promise<SocialConnection> {
    const connection = this.socialConnectionsRepository.create(
      createSocialConnectionDto
    );
    return this.socialConnectionsRepository.save(connection);
  }

  async findByProviderAndProviderId(
    provider: string,
    providerId: string
  ): Promise<SocialConnection | null> {
    return this.socialConnectionsRepository.findOne({
      where: { provider, providerId },
      relations: ["user"],
    });
  }
}
