import { Request, Response, NextFunction } from 'express';
import { blacklistManager } from '@common/BlacklistManager/BlacklistManager';

import { loginRoute } from '@common/LimiterMiddleware/LoginLimiter';

class AuthController {
  /**
   * 注册
   * @param req 
   * @param res 
   */ 
  register = async (req: Request, res: Response) => {
    console.log('(req as any).user :>> ', (req as any).user);
    const user = (req as any).user;
    (res as any).AjaxResult.success(200,user);
  };

  /**
   * 登录
   * @param req 
   * @param res 
   * @returns 
   */ 
  login = async (req: Request, res: Response,next: NextFunction) => {
    try {
      await loginRoute(req,res,next);
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
        .catch(() => {
          (res as any).AjaxResult.fail(500); // 如果 Memcached 发生错误，返回 500 错误
        });
    } else {
      (res as any).AjaxResult.bizFail(401,"会话已失效"); // 如果没有提供 token，返回 401 错误
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const authController = new AuthController();
