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
import { UserRole } from "./UsersRole";
import { Organization } from "./OrganizationsModel";
import { Sessions } from "./Sessions";
import { TechnicalBulletins } from "./TechnicalBulletinsModel";
import { EvaluationHistory } from "./ EvaluationsHistoryModel";
import { WorkReport } from "./WorkReportsModel";
import { Inspection } from "./InspectionsModel";
import { InspectionHistory } from "./InspectionsWorkReportModel";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, (organization) => organization.org_id)
  @JoinColumn({ name: "org_id" })
  organization: Organization;

  @Column("int")
  org_id: number;

  @ManyToOne(() => UserRole, (userRole) => userRole.id)
  @JoinColumn({ name: "role" })
  role: UserRole;

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

  @OneToMany(() => EvaluationHistory, (evaluation) => evaluation.user)
  evaluations: EvaluationHistory[];

  @OneToMany(() => WorkReport, (workreport) => workreport.user)
  workreports: EvaluationHistory[];

  @OneToMany(() => Inspection, (Inspection) => Inspection.user)
  Inspections: Inspection[];

  @OneToMany(
    () => InspectionHistory,
    (Inspectionhistory) => Inspectionhistory.user
  )
  Inspectionhistory: InspectionHistory[];
}
