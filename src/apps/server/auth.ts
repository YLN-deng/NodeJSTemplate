import { Request, Response } from "express";
import { blacklistManager } from "@common/BlacklistManager/BlacklistManager";
import { User } from "apps/models/User";
import connection from "@database/index";
import logger from "@utils/logger";
import { comparePassword } from "@utils/bcrypt";
import svgCaptcha from "svg-captcha";

import { generateHash } from "@utils/bcrypt";
import { redisInstance } from "@redis/redis";

/**
 * 登录验证
 * @param req
 * @returns
 */
const authSchema = async (req: Request) => {
  try {
    const account = req.body.account;
    const password = req.body.password;
    const code = req.body.code.toLowerCase(); // 将用户输入的验证码转换为小写
    const savedCaptcha = (req as any).session.captcha || ""; // 从 session 中获取保存的验证码并转换为小写

    // 验证验证码是否在3分钟内有效
    if (Date.now() - savedCaptcha.timestamp > 180000) {
      return {
        codeError: false,
        message: "验证码已失效",
        isLoggedIn: false,
        exists: false,
        token: "",
      };
    }

    // 如果验证码错误则返回错误信息
    if (!(savedCaptcha && code === savedCaptcha.text.toLowerCase())) {
      return {
        codeError: false,
        message: "验证码错误",
        isLoggedIn: false,
        exists: false,
        token: "",
      };
    }

    // 创建用户实例信息
    let user;
    // 检测是否是邮箱，或者账号
    if (account.includes("@")) {
      user = await connection.getRepository(User).findOne({
        where: {
          user_email: account,
        },
      });
    } else {
      user = await connection.getRepository(User).findOne({
        where: {
          user_account: account,
        },
      });
    }

    if (user) {
      // 如果找到了用户，可以进行密码哈希验证
      const resultComparePassword = await comparePassword(
        password,
        user.user_password
      );
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
        const token = await blacklistManager.generateJWT(
          payload,
          secretKey,
          process.env.NODE_EXPIRESIN ? process.env.NODE_EXPIRESIN : "1h"
        );
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
  } catch (error: any) {
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

/**
 * 注册用户
 * @param req
 * @param res
 * @returns
 */
const registerService = async (req: Request, res: Response) => {
  // 要保存的用户信息
  const { email, code, password } = req.body;
  // 从redis中获取请求的邮箱验证码
  const redisCode = await redisInstance.get(email);

  // 判断redis的验证码是否与输入的验证码相同
  if (code !== redisCode) {
    return (res as any).AjaxResult.bizFail(400, "验证码错误");
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
  return (res as any).AjaxResult.success(200, result);
};

/**
 * 生成验证码
 * @param req
 * @param res
 */
const captchaService = (req: Request, res: Response) => {
  const captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    ignoreChars: "0o1il", // 忽略的字符
    noise: 6, // 干扰线条的数量
    color: true, // 随机颜色
    background: "#f0f0f0", // 背景色
  });

  // 将验证码文本保存到 session 中，用于验证
  (req as any).session.captcha = {
    text: captcha.text,
    timestamp: Date.now(),
  };

  // 设置响应类型为 SVG
  res.type("svg");
  // 发送验证码图片
  res.send(captcha.data);
};

/**
 * 退出登录
 * @param req
 * @param res
 */
const logoutService = (req: Request, res: Response) => {
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
    (res as any).AjaxResult.bizFail(401, "会话已失效"); // 如果没有提供 token，返回 401 错误
  }
};

export { authSchema, registerService, captchaService, logoutService };
