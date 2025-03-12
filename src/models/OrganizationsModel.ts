import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Aircraft } from "./AircraftsModel";
import { Users } from "./UsersModel";
import { TechnicalBulletins } from "./TechnicalBulletinsModel";
import { Inspection } from "./InspectionsModel";
import { Components } from "./ComponentsModel";

@Entity("organization")
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 225 })
  org_id: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @OneToMany(() => Users, (users: Users) => users.organization)
  users: Users[];

  @OneToMany(() => Aircraft, (aircraft: Aircraft) => aircraft.organization)
  aircrafts: Aircraft[];

  @OneToMany(
    () => TechnicalBulletins,
    (TechnicalBulletin) => TechnicalBulletin.organization
  )
  TechnicalBulletin: TechnicalBulletins[];

  @OneToMany(
    () => Inspection,
    (inspections: Inspection) => inspections.organization
  )
  inspections: Inspection[];

  @OneToMany(
    () => Components,
    (components: Components) => components.organization
  )
  components: Components[];
}
