import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SocialConnectionsService } from "./social-connections.service";
import { SocialConnection } from "./entities/social_connections.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SocialConnection])],
  providers: [SocialConnectionsService],
  exports: [SocialConnectionsService],
})
export class SocialConnectionsModule {}
