import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Aircraft } from "./AircraftsModel";
import { Users } from "./UsersModel";

@Entity("organization")
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "int", default: 1})
  org_id: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

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

  @OneToMany(() => Users, (users: Users) => users.organization)
  users: Users[];

  @OneToMany(() => Aircraft, (aircraft: Aircraft) => aircraft.organization)
  aircrafts: Aircraft[];
}
