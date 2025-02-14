import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from "typeorm";
import { Users } from "./UsersModel";
import { Aircraft } from "./AircraftsModel";


@Entity("techincal_bullettins")
export class TechincalBullettins {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraft_id" })
  aircraft: Aircraft;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraft_id: number;

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

  @Column({ type: "int", nullable: true })
  remaining_hours: number | null;

  @Column({ type: "int", nullable: true })
  remaining_cycles: number | null;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;
}
