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
import { Users } from "./UsersModel";
import { Aircraft } from "./AircraftsModel";
import { Organization } from "./OrganizationsModel";

@Entity("inspections")
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.Inspections, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraft_id" })
  aircraft: Aircraft;

  @ManyToOne(() => Organization, (organization) => organization.id)
  @JoinColumn({ name: "org_id" })
  organization: Organization;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraft_id: number;

  @Column("int")
  org_id: number;

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

  @Column({ type: "tinyint", default: 1, nullable: false })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;
}
