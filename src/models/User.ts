import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import {
  IsByteLength,
  IsNotEmpty,
  IsString,
  IsInt,
  IsAlphanumeric,
  IsEmail,
  MinLength,
  MaxLength
} from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @Column()
  @MinLength(6, {message: '用户名长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, {message: '用户名长度不能多于 18 位' })                  //检查字符串的长度是否不超过给定数字
  @IsAlphanumeric()
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @Column()
  @MinLength(6, {message: '账号长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, {message: '账号长度不能多于 18 位' })                  //检查字符串的长度是否不超过给定数字
  @IsAlphanumeric()
  @IsString()
  @IsNotEmpty()
  user_account: string;

  @Column()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @Column()
  @IsByteLength(6,24)
  @IsString()
  @IsNotEmpty()
  user_password: string;

  constructor(
    user_id: number,
    user_name: string,
    user_account: string,
    user_email: string,
    user_password: string
  ) {
    this.user_id = user_id;
    this.user_name = user_name;
    this.user_account = user_account;
    this.user_email = user_email;
    this.user_password = user_password;
  }
}
