import { Request } from 'express';
import { blacklistManager } from "@common/BlacklistManager/BlacklistManager";
import { User } from "apps/models/User";
import connection from "@database/index";
import logger from "@utils/logger";
import {comparePassword} from '@utils/bcrypt';

/**
 * 登录验证
 * @param req 
 * @returns 
 */
const authSchema = async (req:Request) => {
  try {
    const account = req.body.account;
    const password = req.body.password;
    const code = req.body.code.toLowerCase(); // 将用户输入的验证码转换为小写
    const savedCaptcha = (req as any).session.captcha || ''; // 从 session 中获取保存的验证码并转换为小写

    // 验证验证码是否在3分钟内有效
    if(Date.now() - savedCaptcha.timestamp > 180000) {
      return {
        codeError: false,
        message: "验证码已失效",
        isLoggedIn: false,
        exists: false,
        token: "",
      }
    }

    // 如果验证码错误则返回错误信息
    if (!(savedCaptcha && code === savedCaptcha.text.toLowerCase())) {
      return {
        codeError: false,
        message: "验证码错误",
        isLoggedIn: false,
        exists: false,
        token: "",
      }
    }

    // 创建用户实例信息
    let user;
    // 检测是否是邮箱，或者账号
    if(account.includes("@")) {
      user = await connection.getRepository(User).findOne({
        where: {
          user_email: account,
        },
      });
    }else {
      user = await connection.getRepository(User).findOne({
        where: {
          user_account: account,
        },
      });
    }

    if (user) {
      // 如果找到了用户，可以进行密码哈希验证
      const resultComparePassword = await comparePassword(password,user.user_password);
      if (resultComparePassword) {
        // 获取token加密和解密的密匙
        const secretKey = process.env.NODE_JWTSECRETKEY;
        // 获取失败返回错误信息
        if (!secretKey)
          return { isLoggedIn: false, exists: false, message: "凭证获取失败" };
        // token 生成信息
        const payload = {
          user_id: user.user_id,
          user_name: user.user_name,
          user_account: user.user_account,
          user_email: user.user_email,
        };
        // 生成 token
        const token = await blacklistManager.generateJWT( payload, secretKey, process.env.NODE_EXPIRESIN?process.env.NODE_EXPIRESIN:"1h" );
        if (!token) {
          return {
            codeError: true,
            isLoggedIn: false,
            exists: true,
            message: "生成会话错误",
          };
        }

        // 验证成功，删除保存的验证码信息
        delete (req as any).session.captcha;

        // 所有处理无误后返回token信息
        return {
          codeError: true,
          isLoggedIn: true,
          exists: true,
          token: token, // 将token对象返回
        };
      } else {
        // resultComparePassword为false时，密码不匹配
        return {
          codeError: true,
          isLoggedIn: false,
          exists: true,
          message: "密码错误",
        };
      }
    } else {
      // user为空时，用户不存在
      return {
        codeError: true,
        isLoggedIn: false,
        exists: false,
        message: "用户不存在",
      };
    }
  } catch (error:any) {
    // 处理数据库查询错误
    logger.error("数据库查询错误:", error);
    return {
      codeError: true,
      isLoggedIn: false,
      exists: false,
      message: error.message || "未知错误",
    };
  }
};

export { authSchema };
