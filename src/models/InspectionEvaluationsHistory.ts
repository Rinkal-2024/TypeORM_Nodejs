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
import { Users } from "./Users";
import { Aircrafts } from "./Aircrafts";
import { Inspections } from "./Inspections";

@Entity("i_evaluation_histories")
export class InspectionEvaluationsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.inspectionEvaluation)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.inspectionEvaluation)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @ManyToOne(
    () => Inspections,
    (inspection) => inspection.inspectionEvaluationHistory
  )
  @JoinColumn({ name: "inspection_id" })
  inspections: Inspections;

  @Column("int")
  user_id: number;

  @Column("int")
  inspection_id: number;

  @Column("int")
  aircraftId: number;

  @Column({ type: "varchar", length: 50 })
  wr_no: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  aircraft_type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  revision: string;

  @Column({ type: "datetime", nullable: true })
  revision_date: Date;

  @Column({ type: "text", nullable: true })
  atachapter: string;

  @Column({ type: "text", nullable: true })
  chapter_section_subject: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  ata_title: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  task_number: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  task_title: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  modes: string;

  @Column({ type: "text", nullable: true })
  climatic_condition: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  mpn: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  pn: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  maintenance_mode: string;

  @Column({ type: "text", nullable: true })
  frequency: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  limit_1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  unit_1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_unit_1: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  limit_2: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  unit_2: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_2: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_unit_2: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  limit_3: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  unit_3: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_3: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  margin_unit_3: string;

  @Column({ type: "text", nullable: true })
  ref_manual: string;

  @Column({ type: "text", nullable: true })
  documentation: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  cycle_type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  i_key: string;

  @Column({ type: "enum", enum: ["Yes", "No"], nullable: true })
  applicable: "Yes" | "No";

  @Column({ type: "text", nullable: true })
  motivation: string;

  @Column({ type: "datetime", nullable: true })
  inspection_date: Date;

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

  @Column({ type: "tinyint", width: 1, default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date;
}




