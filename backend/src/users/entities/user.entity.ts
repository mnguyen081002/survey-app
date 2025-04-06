import {
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { SocialConnection } from "../../social-connections/entities/social_connections.entity";
import { Survey } from "../../surveys/entities/survey.entity";
import { Response } from "../../responses/entities/response.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: "google" })
  provider: string;

  @Column({ nullable: false })
  providerId: string;

  @OneToMany(() => SocialConnection, (connection) => connection.user)
  socialConnections: SocialConnection[];

  @OneToMany(() => Survey, (survey) => survey.creator)
  surveys: Survey[];

  @OneToMany(() => Response, (response) => response.user)
  responses: Response[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
