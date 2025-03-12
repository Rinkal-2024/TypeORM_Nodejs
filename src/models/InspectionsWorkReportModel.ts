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

@Entity("i_work_report")
export class InspectionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.Inspectionhistory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircraft, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraft_id" })
  aircraft: Aircraft;

  @Column("int")
  user_id: number;

  @Column("int")
  aircraft_id: number;

  @Column("int")
  org_id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  wr_no: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  title: string;

  @Column({ type: "datetime", nullable: true })
  wr_date: Date;

  @Column({ type: "int", nullable: true })
  remaining_days: number;

  @Column({ type: "int", nullable: true })
  remaining_hours: number;

  @Column({ type: "int", nullable: true })
  remaining_cycles: number;

  @Column({ type: "datetime", nullable: true })
  expiry_date: Date;

  @Column({ type: "datetime", nullable: true })
  last_date: Date;

  @Column({ type: "text", nullable: true })
  work_report: string;

  @Column({ type: "text", nullable: true })
  signature: string;

  @Column({ type: "text", nullable: true })
  additional_control: string;

  @Column({ type: "text", nullable: true })
  notes_measurements: string;

  @Column({
    type: "tinyint",
    default: 1,
    nullable: false,
    comment: "1 = Active, 0 = Inactive",
  })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date;
}
