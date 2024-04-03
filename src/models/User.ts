import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  user_name: string;

  @Column()
  user_email: string;

  @Column({ length: 24 })
  user_password: string;

  constructor(
    user_id: number,
    user_name: string,
    user_email: string,
    user_password: string
  ) {
    this.user_id = user_id;
    this.user_name = user_name;
    this.user_email = user_email;
    this.user_password = user_password;
  }
}
