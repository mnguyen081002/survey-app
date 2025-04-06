import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { SocialConnectionsService } from "../social-connections/social-connections.service";
import { User } from "../users/entities/user.entity";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";

interface SocialUserProfile {
  email: string;
  name: string;
  picture: string | null;
  provider: string;
  providerId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly serviceUrl = process.env.SERVICE_URL;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly socialConnectionsService: SocialConnectionsService
  ) {}

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async validateSocialUser(profile: SocialUserProfile): Promise<User> {
    const { email, name, picture, provider, providerId } = profile;

    const connection =
      await this.socialConnectionsService.findByProviderAndProviderId(
        provider,
        providerId
      );

    if (connection) {
      return connection.user;
    }

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Tạo user mới
      user = await this.usersService.create({
        email,
        name,
        picture,
        provider,
        providerId,
      });
    }

    await this.socialConnectionsService.create({
      provider,
      providerId,
      user,
    });

    return user;
  }

  @Cron("0 */3 * * * *")
  async keepServiceAlive() {
    try {
      this.logger.debug("Gọi service để tránh bị sleep...");
      await axios.get(`${this.serviceUrl}/health`);
      this.logger.debug("Đã gọi service thành công!");
    } catch (error) {
      this.logger.error(`Lỗi khi gọi service: ${error.message}`);
    }
  }
}
