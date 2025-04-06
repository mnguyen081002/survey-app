import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";

interface SocialUserProfile {
  email: string;
  name: string;
  picture: string | null;
  provider: string;
  providerId: string;
}

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  "google"
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: configService.get("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any
  ): Promise<any> {
    try {
      const userProfile = this.extractUserProfile(profile);
      return await this.authService.validateSocialUser(userProfile);
    } catch (error) {
      throw error;
    }
  }

  private extractUserProfile(profile: any): SocialUserProfile {
    const { name, emails, photos } = profile;

    return {
      email: emails[0].value,
      name: name.givenName + " " + name.familyName,
      picture: photos?.[0]?.value || null,
      provider: "google",
      providerId: profile.id,
    };
  }
}
