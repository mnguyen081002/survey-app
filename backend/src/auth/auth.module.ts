import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";
import { SocialConnectionsModule } from "../social-connections/social-connections.module";
import { GoogleAuthStrategy } from "./strategies/google.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: {
          expiresIn: Number(configService.get("JWT_EXPIRATION")),
        },
      }),
    }),
    UsersModule,
    SocialConnectionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleAuthStrategy],
  exports: [AuthService],
})
export class AuthModule {}
