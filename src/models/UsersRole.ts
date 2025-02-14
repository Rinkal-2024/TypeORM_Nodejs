import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity("user_role")
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  role: string;

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
}
