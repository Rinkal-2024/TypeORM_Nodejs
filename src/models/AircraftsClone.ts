import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,

  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "aircraft_clone" })
export class AircraftClone { // also filename aircraftClone (without s)
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  organizationId: number;

  @Column({ type: "varchar", length: 100 })
  type: string;

  @Column({ type: "varchar", length: 100 })
  registrationMark: string;

  @Column({ type: "varchar", length: 100 })
  serialNumber: string;

  @Column({ type: "varchar", length: 100 })
  manufacturer: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  manufacturerDate: string;

  @Column({ type: "varchar", length: 100 })
  aircraftType: string;

  @Column({ type: "datetime" })
  expiredAt: Date;

  @Column({ type: "varchar", length: 100 })
  fuelType: string;

  @Column({ type: "tinyint", default: 0 })
  hasEngine2: boolean;

  @Column({ type: "tinyint", default: 0 })
  hasTripFuel: boolean;

  @Column({ type: "varchar", length: 100 })
  airframeHours: string;

  @Column({ type: "int" })
  airframeCycles: number;

  @Column({ type: "varchar", length: 100 })
  engine1Hours: string;

  @Column({ type: "int" })
  engine1N1: number;

  @Column({ type: "int" })
  engine1N2: number;

  @Column({ type: "int" })
  engine1Imp: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  engine2Hours: string;

  @Column({ type: "int", nullable: true })
  engine2N1: number;

  @Column({ type: "int", nullable: true })
  engine2N2: number;

  @Column({ type: "int", nullable: true })
  engine2Imp: number;

  @Column({ type: "int" })
  emptyWeight: number;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
