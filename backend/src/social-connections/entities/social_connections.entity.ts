import { Entity, Column, ManyToOne } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("social_connections")
export class SocialConnection extends BaseEntity {
  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.socialConnections)
  user: User;
}
