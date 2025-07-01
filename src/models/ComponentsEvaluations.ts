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
import { Components } from "./Components";

@Entity("c_evaluation_histories")
export class ComponentsEvaluations {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.inspectionEvaluation)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Aircrafts, (aircraft) => aircraft.inspectionEvaluation)
  @JoinColumn({ name: "aircraftId" })
  aircraft: Aircrafts;

  @ManyToOne(() => Components, (components) => components.componentsEvaluations)
  @JoinColumn({ name: "component_id" })
  components: Components;

  @Column("int")
  user_id: number;

  @Column("int")
  component_id: number;

  @Column("int")
  aircraftId: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  cycle_type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  c_key: string;

  @Column({ type: "enum", enum: ["Yes", "No"], nullable: true })
  applicable: "Yes" | "No";

  @Column({ type: "text", nullable: true })
  motivation: string;

  @Column({ type: "datetime", nullable: true })
  exp_date: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  exp_hours: string;

  @Column({ type: "int", nullable: true })
  exp_cycles: number;

  @Column({ type: "datetime", nullable: true })
  rem_days: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  rem_hours: string;

  @Column({ type: "int", nullable: true })
  rem_cycles: number;

  @Column({ type: "tinyint", width: 1, default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date;
}
