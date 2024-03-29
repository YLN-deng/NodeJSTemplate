import { Request, Response } from "express";
import {blacklistManager} from '@utils/BlacklistManager';
import ResultAjax from '@common/result/ResultAjax';

class UserController {
  /**
   * 注册
   * @param req 
   * @param res 
   */ 
  register = async (req: Request, res: Response) => {
    // ...内部的具体注册逻辑
  };

  /**
   * 登录
   * @param req 
   * @param res 
   * @returns 
   */ 
  login = async (req: Request, res: Response) => {
    const secretKey = process.env.NODE_JWTSECRETKEY;
    if(!secretKey) return res.status(400).json(ResultAjax.fail("登录失败"));
    const user = {
      id:1,
      name:"test"
    }
    const token = await blacklistManager.generateJWT(user,secretKey,'1h')
    res.status(200).json(ResultAjax.success(token));
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
          res.status(200).json(ResultAjax.success("退出登录")); // 返回成功状态码
        })
        .catch((err) => {
          res.status(500).json(ResultAjax.fail("退出失败")); // 如果 Memcached 发生错误，返回 500 错误
        });
    } else {
      res.status(401).json(ResultAjax.fail("Token is missing")); // 如果没有提供 token，返回 401 错误
    }
  };
}

// 创建一个上述类的一个实例，将其导出
export const userController = new UserController();
