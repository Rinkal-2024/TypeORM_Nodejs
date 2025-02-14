import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserRole } from "./UsersRole";
import { Organization } from "./OrganizationsModel";
import { TechincalBullettins } from "./TechincalBullettinsModel";

@Entity("user")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Organization, (organization) => organization.org_id)
  @JoinColumn({ name: "org_id" })
  organization: Organization;

  @Column("int")
  org_id: number;

  @ManyToOne(() => UserRole, (userRole) => userRole.id)
  @JoinColumn({ name: "role" })
  role: UserRole;

  @Column({ type: "varchar", length: 50, nullable: true })
  first_name: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  last_name: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  mobile: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "varchar", length: 2, default: "en" })
  language: string;

  @Column({ type: "tinyint", default: 1 })
  status: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TechincalBullettins, (techBullettin) => techBullettin.user)
  techBullettins: TechincalBullettins[];
}
