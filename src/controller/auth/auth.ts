import { Request, Response, NextFunction } from "express";
import { blacklistManager } from "@common/BlacklistManager/BlacklistManager";

import { loginRoute } from "@common/LimiterMiddleware/LoginLimiter";

import { User } from "@models/User";
import connection from "@database/index";
import logger from "@utils/logger";
import {generateHash} from '@utils/bcrypt';
import {sendEmail} from '@utils/mailer';
import { redisInstance } from '@redis/redis';

class AuthController {
  /**
   * 注册
   * @param req
   * @param res
   */
  register = async (req: Request, res: Response) => {
    // 要保存的用户信息
    const { email, code, password } = req.body;

    try {
      // 从redis中获取请求的邮箱验证码
      const redisCode = await redisInstance.get(email);

      // 判断redis的验证码是否与输入的验证码相同
      if(code !== redisCode) {
        return (res as any).AjaxResult.bizFail(400,"验证码错误");
      }

      // 在邮箱地址中获取账号
      const account = email.split("@")[0];
      // 生成哈希密码
      const hashPassword = await generateHash(password);

      // 写入数据库
      // 创建一个新的User实体
      const newUser = new User();
      newUser.user_name = account;
      newUser.user_account = account;
      newUser.user_email = email;
      newUser.user_password = hashPassword;

      // 将新用户保存到数据库
      const userRepository = connection.getRepository(User).create(newUser);
      const result = connection.getRepository(User).save(userRepository);

      // 返回成功响应
      return (res as any).AjaxResult.success(200,result);
    } catch (error) {
      // 如果保存用户时出现错误，则返回错误响应
      logger.error("注册用户时出错:", error);
      return (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 发送邮件验证码
   * @param req
   * @param res
   */
  sendMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sendEmail(req, res, next);
    } catch (error) {
      (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 登录
   * @param req
   * @param res
   * @returns
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await loginRoute(req, res, next);
    } catch (err) {
      (res as any).AjaxResult.fail(500);
    }
  };

  /**
   * 退出登录
   * @param req
   * @param res
   */
  logout = async (req: Request, res: Response) => {
    const token = req.headers.authorization; // 获取 token
    if (token) {
      // 将 token 加入黑名单
      blacklistManager
        .revokeToken(token)
        .then(() => {
          (res as any).AjaxResult.success(200); // 返回成功状态码
        })
        .catch((err) => {
          (res as any).AjaxResult.fail(500); // 如果 Memcached 发生错误，返回 500 错误
        });
    } else {
      (res as any).AjaxResult.bizFail(401, "会话已失效"); // 如果没有提供 token，返回 401 错误
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const authController = new AuthController();
