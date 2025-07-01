import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Aircrafts } from "./Aircrafts";
import { Users } from "./Users";
import { TechnicalBulletins } from "./TechnicalBulletins";
import { Inspections } from "./Inspections";
import { Components } from "./Components";
import { LatestMovements } from "./LatestMovements";

@Entity("organizations")
export class Organizations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 225 })
  organizationId: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  street: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  city: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  postlCode: string;

  @Column({ type: "int", nullable: true })
  countryId: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  phone: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @OneToMany(() => Users, (users: Users) => users.organization)
  users: Users[];

  @OneToMany(() => Aircrafts, (aircraft: Aircrafts) => aircraft.organization)
  aircrafts: Aircrafts[];

  @OneToMany(
    () => TechnicalBulletins,
    (TechnicalBulletin) => TechnicalBulletin.organization
  )
  TechnicalBulletin: TechnicalBulletins[];

  @OneToMany(
    () => Inspections,
    (inspections: Inspections) => inspections.organization
  )
  inspections: Inspections[];

  @OneToMany(
    () => Components,
    (components: Components) => components.organization
  )
  components: Components[];

  @OneToMany(
    () => LatestMovements,
    (Movement: LatestMovements) => Movement.organization
  )
  Movement: LatestMovements[];
}
