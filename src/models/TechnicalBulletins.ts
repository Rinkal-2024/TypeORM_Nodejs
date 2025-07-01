import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Users } from "./Users";
import { Aircrafts } from "./Aircrafts";
import { Organizations } from "./Organizations";
import { WorkReports } from "./WorkReports";
import { EvaluationsHistory } from "./EvaluationsHistory";

@Entity("technical_bulletins")
export class TechnicalBulletins {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @ManyToOne(() => Organizations, (organization) => organization.organizationId)
  @JoinColumn({ name: "organizationId" })
  organization: Organizations;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraftId: number;

  @Column("int")
  organizationId: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  sb_no: string;

  @Column({ type: "datetime", nullable: true })
  issue_date: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  revision: string | null;

  @Column({ type: "datetime", nullable: true })
  revision_date: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  category: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  ed_easa: string | null;

  @Column({ type: "datetime", nullable: true })
  ed_easa_issue_date: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  cdn: string | null;

    @Column({ type: "datetime", nullable: true })
    cdn_issue_date: Date | null;

  @Column({ type: "text", nullable: true })
  pa_enac: string | null;

  @Column({ type: "datetime", nullable: true })
  pa_enac_issue_date: Date | null;

  @Column({ type: "text", nullable: true })
  effectivity: string | null;

  @Column({ type: "text", nullable: true })
  title: string | null;

  @Column({ type: "text", nullable: true })
  remark: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  limit_type: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  hourly_periodicity_limit: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  calendar_periodicity_limit: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  cycle_periodicity: string | null;

  @Column({ type: "text", nullable: true })
  note: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  type: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  tb_status: string | null;

  @Column({ type: "datetime", nullable: true })
  date: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  fa_ad: string | null;

  @Column({ type: "text", nullable: true })
  work_report: string | null;

  @Column({ type: "int", nullable: true })
  remaining_days: number | null;

  @Column({ type: "varchar", nullable: true })
  remaining_hours: number | null;

  @Column({ type: "int", nullable: true })
  remaining_cycles: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  aircraft_type: string | null;

  @Column({ type: "datetime", nullable: true })
  appli_expiration_notice: Date | null;

  @Column({ nullable: true })
  tb_appli_expiration_hour: number;

  @Column({ nullable: true })
  tb_appli_expiration_minutes: number;

  @Column({ nullable: true })
  tb_appli_expiration_cycle: number;

  @Column({ type: "varchar", length: 100 })
  registration_mark: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @Column({ type: "timestamp", nullable: true })
  updated_at: Date | null;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => WorkReports, (workReport) => workReport.technicalBulletins)
  workReportData: WorkReports[];

  @OneToMany(
    () => EvaluationsHistory,
    (evaluationHistory) => evaluationHistory.technicalBulletins
  )
  tbEvaluationHistory: EvaluationsHistory[];
}
