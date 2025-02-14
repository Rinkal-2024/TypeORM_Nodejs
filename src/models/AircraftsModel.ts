import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Organization } from "./OrganizationsModel";
import { TechincalBullettins } from "./TechincalBullettinsModel";

@Entity({ name: "aircrafts" })
export class Aircraft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  org_id: number;

  @ManyToOne(() => Organization, (organization) => organization.aircrafts)
  @JoinColumn({ name: "org_id" })
  organization: Organization;

  @Column({ type: "varchar", length: 100 })
  type: string;

  @Column({ type: "varchar", length: 100 })
  registration_mark: string;

  @Column({ type: "varchar", length: 100 })
  serial_number: string;

  @Column({ type: "varchar", length: 100 })
  manufacturer: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  manufacturer_date: string;

  @Column({ type: "varchar", length: 100 })
  aircraft_type: string;

  @Column({ type: "datetime" })
  expire_at: Date;

  @Column({ type: "varchar", length: 100 })
  fuel_type: string;

  @Column({ type: "tinyint", default: 0 })
  has_engine2: boolean;

  @Column({ type: "tinyint", default: 0 })
  has_trip_fuel: boolean;

  @Column({ type: "varchar", length: 100 })
  airframe_hours: string;

  @Column({ type: "int" })
  airframe_cycles: number;

  @Column({ type: "varchar", length: 100 })
  engine1_hours: string;

  @Column({ type: "int" })
  engine1_n1: number;

  @Column({ type: "int" })
  engine1_n2: number;

  @Column({ type: "int" })
  engine1_imp: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  engine2_hours: string;

  @Column({ type: "int", nullable: true })
  engine2_n1: number;

  @Column({ type: "int", nullable: true })
  engine2_n2: number;

  @Column({ type: "int", nullable: true })
  engine2_imp: number;

  @Column({ type: "int" })
  empyt_weight: number;

  @Column({ type: "tinyint", default: 1 })
  status: number; // 1 = Active, 0 = Inactive

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date; // Soft delete column

  @OneToMany(
    () => TechincalBullettins,
    (techBullettin) => techBullettin.aircraft
  )
  techBullettins: TechincalBullettins[];
}
