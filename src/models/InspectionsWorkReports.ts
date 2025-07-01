import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./Users";
import { Aircrafts } from "./Aircrafts";
import { Inspections } from "./Inspections";

@Entity("i_work_report")
export class InspectionsWorkReports {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.Inspectionhistory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @ManyToOne(() => Inspections, (inspection) => inspection.inspectionHistory)
  @JoinColumn({ name: "inspection_id" })
  inspections: Inspections;

  @Column("int")
  user_id: number;

  @Column("int")
  inspection_id: number;

  @Column("int")
  aircraftId: number;

  @Column({ type: "varchar", length: 255, unique: true })
  wr_no: string;

  @Column({ type: "text" })
  chapter_section_subject: string;

  @Column({ type: "varchar", length: 255 })
  ata_title: string;

  @Column({ type: "varchar", length: 255 })
  task_number: string;

  @Column({ type: "varchar", length: 255 })
  task_title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", length: 255 })
  mpn: string;

  @Column({ type: "varchar", length: 255 })
  pn: string;

  @Column({ type: "text" })
  ref_manual: string;

  @Column({ type: "text" })
  documentation: string;

  @Column({ type: "varchar", length: 255 })
  sub_task: string;

  @Column({ type: "text", nullable: true })
  signature: string;

  @Column({ type: "text", nullable: true })
  additional_control: string;

  @Column({ type: "text", nullable: true })
  notes_measurements: string;

  @Column({ type: "datetime", nullable: true })
  inspection_date: Date;

  @Column({ type: "datetime", nullable: true })
  inspection_requested_date: Date;

  @Column({ type: "datetime", nullable: true })
  next_date_exp: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  insp_hours: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  next_hours_exp: string;

  @Column({ type: "int", nullable: true })
  insp_cycles: number;

  @Column({ type: "int", nullable: true })
  next_cycles_exp: number;

  @Column({ type: "varchar", length: 255 })
  work_report: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date;
}
