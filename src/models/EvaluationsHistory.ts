import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Users } from "./Users";
import { Aircrafts } from "./Aircrafts";
import { TechnicalBulletins } from "./TechnicalBulletins";

@Entity("tb_evaluation_histories")
export class EvaluationsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.evaluations, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(
    () => TechnicalBulletins,
    (technicalBulletins) => technicalBulletins.tbEvaluationHistory
  )
  @JoinColumn({ name: "technical_bulletin_id" })
  technicalBulletins: TechnicalBulletins;

  @Column("int")
  user_id: number;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @Column("int")
  aircraftId: number;

  @Column("int")
  technical_bulletin_id: number;

  @Column({ type: "varchar", length: 255 })
  eh_status: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "varchar", length: 255 })
  easa_ad: string;

  @Column({ type: "varchar", length: 255 })
  fa_ad: string;

  @Column({ type: "text" })
  service_bulletin: string;

  @Column({ type: "datetime" })
  evaluation_date: Date;

  @Column({ type: "text" })
  work_report: string;

  @Column({ type: "text" })
  note: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;
}
