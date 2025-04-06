import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Survey } from "../../surveys/entities/survey.entity";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("responses")
export class Response extends BaseEntity {
  @Column({ type: "jsonb", nullable: false })
  answers: any;

  @Column({ type: "text", nullable: true })
  aiSummary: string;

  @ManyToOne(() => Survey, (survey) => survey.responses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "survey_id" })
  survey: Survey;

  @ManyToOne(() => User, (user) => user.responses, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;
}
