import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./UsersModel";

@Entity("sessions")
export class Sessions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  userId: number;

  @Column({
    length: "1024",
  })
  token: string;

  @Column({
    type: "datetime",
    comment: "YYYY-MM-DD HH:mm",
  })
  loginAt: string;

  @Column({
    default: null,
    type: "datetime",
    comment: "YYYY-MM-DD HH:mm",
  })
  loggedOutAt: string;

  @ManyToOne((type) => Users, (user) => user.session)
  user: Users;
}