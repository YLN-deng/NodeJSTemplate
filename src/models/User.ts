import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import {
  IsByteLength,
  IsNotEmpty,
  IsString,
  IsInt,
  IsAlphanumeric,
  IsEmail,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  @IsNotEmpty()
  user_id!: number;

  @Column()
  @IsString()
  @MinLength(6, {message: '用户名长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, {message: '用户名长度不能多于 18 位' })                  //检查字符串的长度是否不超过给定数字
  @IsAlphanumeric(undefined, {message:"用户名仅包含字母和数字"})
  @IsNotEmpty({message: "用户名不能为空"})
  user_name!: string;

  @Column()
  @IsString()
  @MinLength(6, {message: '账号长度不能小于 6 位' })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, {message: '账号长度不能多于 18 位' })                  //检查字符串的长度是否不超过给定数字
  @IsAlphanumeric(undefined, {message:"账号仅包含字母和数字"})
  @IsNotEmpty({message: "账号不能为空"})
  user_account!: string;

  @Column()
  @IsString()
  @IsEmail({}, {message: "邮箱地址格式错误"})
  @IsNotEmpty({message: "邮箱地址不能为空"})
  user_email!: string;

  @Column()
  @IsString()
  @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
  @IsNotEmpty({message: "密码不能为空"})
  user_password!: string;
}
