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
import { Users } from "./UsersModel";
import { Aircraft } from "./AircraftsModel";

@Entity("tb_work_report")
export class WorkReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.workreports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraft_id" })
  aircraft: Aircraft;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraft_id: number;

  @Column({ type: "varchar", length: 100, unique: true })
  wr_no: string;

  @Column({ type: "varchar", length: 255 })
  sb_no: string;

  @Column({ type: "varchar", length: 255 })
  ed_easa: string;

  @Column({ type: "varchar", length: 255 })
  cdn: string;

  @Column({ type: "text" })
  pa_enac: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  remark: string;

  @Column({ type: "varchar", length: 255 })
  limit_type: string;

  @Column({ type: "text" })
  note: string;

  @Column({ type: "text" })
  signature: string;

  @Column({ type: "text" })
  additional_control: string;

  @Column({ type: "text" })
  notes_measurements: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;
}
