import { Request, Response, NextFunction } from "express";
import logger from "@utils/logger";

import { loginRoute } from "@common/LimiterMiddleware/LoginLimiter";
import {sendEmail} from '@utils/mailer';
import { registerService, captchaService, logoutService } from '@apps/server/auth';

class AuthController {
  /**
   * 注册
   * @param req
   * @param res
   */
  register = async (req: Request, res: Response) => {
    try {
      await registerService(req, res);
    } catch (error) {
      logger.error("注册用户时出错:", error);
      (res as any).AjaxResult.fail(500);
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
   * 生成验证码
   * @param req 
   * @param res 
   */
  captcha = async (req: Request, res: Response) => {
    try {
      captchaService(req, res);
    } catch (error) {
      logger.error("生成验证码错误:", error);
      (res as any).AjaxResult.fail(500);
    }
  }

  /**
   * 退出登录
   * @param req
   * @param res
   */
  logout = async (req: Request, res: Response) => {
    try {
      logoutService(req, res);
    } catch (error) {
      logger.error("退出登录错误:", error);
      (res as any).AjaxResult.fail(500);
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const authController = new AuthController();
