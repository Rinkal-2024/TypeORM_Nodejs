import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserRoles } from "./UserRoles";
import { Organizations } from "./Organizations";
import { Sessions } from "./Sessions";
import { TechnicalBulletins } from "./TechnicalBulletins";
import { EvaluationsHistory } from "./EvaluationsHistory";
import { WorkReports } from "./WorkReports";
import { Inspections } from "./Inspections";
import { InspectionsWorkReports } from "./InspectionsWorkReports";
import { InspectionEvaluationsHistory } from "./InspectionEvaluationsHistory";
import { LatestMovements } from "./LatestMovements";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organizations, (organization) => organization.organizationId)
  @JoinColumn({ name: "organizationId" })
  organization: Organizations;

  @Column("int")
  organizationId: number;

  @ManyToOne(() => UserRoles, (userRole) => userRole.id)
  @JoinColumn({ name: "role" })
  role: UserRoles;

  @Column({ type: "varchar", length: 50, nullable: true })
  first_name: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  last_name: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  mobile: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 2, default: "en" })
  language: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @OneToMany(
    () => TechnicalBulletins,
    (technicalBulletin) => technicalBulletin.user
  )
  techBullettins: TechnicalBulletins[];

  @OneToMany((type) => Sessions, (session) => session.user)
  session: Sessions;

  @OneToMany(() => EvaluationsHistory, (evaluation) => evaluation.user)
  evaluations: EvaluationsHistory[];

  @OneToMany(
    () => InspectionEvaluationsHistory,
    (inspectionEvaluation) => inspectionEvaluation.user
  )
  inspectionEvaluation: InspectionEvaluationsHistory[];

  @OneToMany(() => WorkReports, (workreport) => workreport.user)
  workreports: WorkReports[];

  @OneToMany(() => Inspections, (Inspection) => Inspection.user)
  Inspections: Inspections[];

  @OneToMany(
    () => InspectionsWorkReports,
    (Inspectionhistory) => Inspectionhistory.user
  )
  Inspectionhistory: InspectionsWorkReports[];

  @OneToMany(() => LatestMovements, (Movement) => Movement.user)
  Movement: LatestMovements[];
}
