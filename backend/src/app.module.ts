import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SurveysModule } from "./surveys/surveys.module";
import { ResponsesModule } from "./responses/responses.module";
import { SocialConnectionsModule } from "./social-connections/social-connections.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DATABASE_HOST"),
        port: configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
        logging:
          process.env.NODE_ENV !== "production" &&
          process.env.NODE_ENV !== "test",
        dropSchema: process.env.NODE_ENV === "test",
        ssl: process.env.DB_SSL === "true",
      }),
    }),

    AuthModule,
    UsersModule,
    SurveysModule,
    ResponsesModule,
    SocialConnectionsModule,
    AiModule,
  ],
})
export class AppModule {}
