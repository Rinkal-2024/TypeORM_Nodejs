import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";
import { Users } from "./Users";
import { Organizations } from "./Organizations";
import { Aircrafts } from "./Aircrafts";

@Entity("latest_movements")
export class LatestMovements {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.Inspections, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Organizations, (organization) => organization.id)
  @JoinColumn({ name: "organizationId" })
  organization: Organizations;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.id)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @Column("int")
  user_id: number;

  @Column("int")
  organizationId: number;

  @Column("int")
  aircraftId: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  type: string;

  @Column({ type: "datetime", nullable: true })
  record_time: Date;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date;
}
