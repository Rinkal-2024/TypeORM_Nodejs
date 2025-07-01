import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Users } from "./Users";
import { Aircrafts } from "./Aircrafts";
import { Organizations } from "./Organizations";
import { InspectionsWorkReports } from "./InspectionsWorkReports";
import { InspectionEvaluationsHistory } from "./InspectionEvaluationsHistory";

@Entity("inspections")
export class Inspections {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.Inspections, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @ManyToOne(() => Organizations, (organization) => organization.id)
  @JoinColumn({ name: "organizationId" })
  organization: Organizations;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraftId: number;

  @Column("int")
  organizationId: number;

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

  @Column({ type: "varchar", length: 100, nullable: true })
  i_status: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  i_key: string;

  @Column({ type: "enum", enum: ["Yes", "No"], nullable: true })
  applicable: "Yes" | "No";

  @Column({ type: "text", nullable: true })
  motivation: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  work_report: string;

  @Column({ type: "datetime", nullable: true })
  exp_date_close: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  exp_hours_close: string;

  @Column({ type: "int", nullable: true })
  exp_cycles_close: number;

  @Column({ type: "tinyint", default: 1, nullable: false })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;

  @OneToMany(
    () => InspectionsWorkReports,
    (inspectionHistory) => inspectionHistory.inspections
  )
  inspectionHistory: InspectionsWorkReports[];

  @OneToMany(
    () => InspectionEvaluationsHistory,
    (inspectionEvaluationHistory) => inspectionEvaluationHistory.inspections
  )
  inspectionEvaluationHistory: InspectionEvaluationsHistory[];
}
