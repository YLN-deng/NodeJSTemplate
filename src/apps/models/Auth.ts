import createError from "http-errors";
import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';
import { validate } from 'class-validator';

import { formatValidationError } from '@utils/schema';

import {
  IsAlphanumeric,
  IsNumberString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsEmail,
  Length
} from 'class-validator';

// 账号登录验证类
export class AuthAccount {
  @IsString()                                                         // 检查该值是否为字符串
  @MinLength(6, { message: "账号长度不能小于 6 位" })                   // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, { message: "账号长度不能多于 18 位" })                 // 检查字符串的长度是否不超过给定数字
  @IsAlphanumeric(undefined, {message:"账号仅包含字母和数字"})          // 检查字符串是否仅包含字母和数字
  @IsNotEmpty({ message: "账号不能为空" })
  user_account!: string;

  @IsString()
  @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
  @IsNotEmpty({ message: "密码不能为空" })
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
  user_password!: string;

  @IsString()
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})                   
  @Length(4, 4, { message: "验证码只能是4位" })                         // 检查字符串的长度是否在某个范围内。
  @IsNotEmpty({ message: "验证码不能为空" })
  user_code!: string;
}

// 邮箱登录验证类
export class AuthEmail {
  @IsString()
  @IsEmail({}, { message: "邮箱地址格式不正确" })
  @IsNotEmpty({ message: "邮箱地址不能为空" })
  user_email!: string;

  @IsString()
  @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
  @IsNotEmpty({ message: "密码不能为空" })
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
  user_password!: string;

  @IsString()
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})                   
  @Length(4, 4, { message: "验证码只能是4位" })                         // 检查字符串的长度是否在某个范围内。
  @IsNotEmpty({ message: "验证码不能为空" })
  user_code!: string;
}

// 注册验证类
export class RegisterEmail {
  @IsString()
  @IsEmail({}, { message: "邮箱地址格式不正确" })
  @IsNotEmpty({ message: "邮箱地址不能为空" })
  user_email!: string;

  @IsString()
  @IsNumberString({}, { message: "验证码只能是数字"})                     // 检查字符串是否为数字                        
  @Length(6, 6, { message: "验证码只能是6位数" })                         // 检查字符串的长度是否在某个范围内。
  @IsNotEmpty({ message: "验证码不能为空" })
  user_code!: string;

  @IsString()
  @MinLength(6, { message: "密码长度不能小于 6 位" })                    // 检查字符串的长度是否不小于给定的数字
  @MaxLength(18, { message: "密码长度不能多于 18 位" })                  // 检查字符串的长度是否不超过给定数字
  @IsNotEmpty({ message: "密码不能为空" })
  @IsAlphanumeric(undefined, {message:"密码仅包含字母和数字"})
  user_password!: string;
}

// 账号密码验证中间件
export const LoginVerificationCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account, password, code } = req.body;

    let authData: any;
    // 判断传入的账号字段是否包含 @ 符号，如果包含则使用邮箱验证，否则使用账号验证
    if (account.includes('@')) {
      authData = new AuthEmail(); // 使用邮箱验证类
      authData.user_email = account; // 设置 user_email 属性
    } else {
      authData = new AuthAccount(); // 使用账号验证类
      authData.user_account = account; // 设置 user_account 属性
    }

    authData.user_code = code;         // 设置 user_code 属性
    authData.user_password = password; // 设置 user_password 属性

    // 使用 class-validator 验证登录数据
    const errors = await validate(authData, { validationError: { target: false } });
    if (errors.length > 0) {
      // 将 class-validator 错误对象转换为自定义格式
      const formattedError = formatValidationError(errors[0]);
      return next(createError(400, formattedError.msg));
    }

    return next();
  } catch (error) {
    logger.error('账号密码验证期间出错：', error);
    return next(createError(500, "系统错误"));
  }
};

// 账号注册验证中间件
export const RegisterVerificationCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email, code, password, cf_password} = req.body;

    if (password !== cf_password) {
      return next(createError(400, '两次密码输入不一致'));
    }

    // 创建对象，设置对象属性
    const registerEmail = new RegisterEmail();
    registerEmail.user_email = email;
    registerEmail.user_code = code;
    registerEmail.user_password = password;

    // 验证对象的值是否正确
    const errors = await validate(registerEmail, { validationError: { target: false } });
    if(errors.length > 0) {
      // 将 class-validator 错误对象转换为自定义格式
      const formattedError = formatValidationError(errors[0]);
      return next(createError(400, formattedError.msg));
    }

    // 通过验证，执行下一个任务
    return next()
  } catch (error) {
    logger.error('注册信息验证期间出错：', error);
    return next(createError(500, "系统错误"));
  }
}
