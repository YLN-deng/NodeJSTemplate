import createError from "http-errors";
import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';
import { validate, ValidationError } from 'class-validator';

import {AuthAccount, AuthEmail} from './verification';

// 将单个 class-validator 错误对象转换为自定义格式的函数
const formatValidationError = (error: ValidationError) => {
  const constraints = error.constraints;
  if (constraints) {
    const property = Object.keys(constraints)[0];
    return {
      code: 400,
      msg: constraints[property],
      time: Date.now(),
      field: property
    };
  } else {
    return {
      code: 400,
      msg: 'Validation error',
      time: Date.now(),
      field: error.property
    };
  }
};

// 账号密码验证中间件
export const LoginVerificationCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account, password } = req.body;

    let authData: any;
    // 判断传入的账号字段是否包含 @ 符号，如果包含则使用邮箱验证，否则使用账号验证
    if (account.includes('@')) {
      authData = new AuthEmail(); // 使用邮箱验证类
      authData.user_email = account; // 设置 user_email 属性
    } else {
      authData = new AuthAccount(); // 使用账号验证类
      authData.user_account = account; // 设置 user_account 属性
    }

    authData.user_password = password; // 设置 user_password 属性

    // 使用 class-validator 验证登录数据
    const errors = await validate(authData, { validationError: { target: false } });
    if (errors.length > 0) {
      // 将 class-validator 错误对象转换为自定义格式
      const formattedError = formatValidationError(errors[0]);
      return next(createError(400, formattedError.msg));
    }

    next();
  } catch (error) {
    logger.error('凭证验证期间出错：', error);
    return next(createError(500, "系统错误"));
  }
};