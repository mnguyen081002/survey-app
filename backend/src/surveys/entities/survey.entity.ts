import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Response } from "../../responses/entities/response.entity";
import { BaseEntity } from "../../common/entities/base.entity";

@Entity("surveys")
export class Survey extends BaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: false })
  questions: any;

  @Column({ type: "jsonb", nullable: false })
  json: any;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.surveys, { onDelete: "CASCADE" })
  @JoinColumn({ name: "creator_id" })
  creator: User;

  @OneToMany(() => Response, (response) => response.survey)
  responses: Response[];

  @Column({ type: "text", nullable: true })
  aiSummary: string;
}
