import createError from "http-errors";
import jwt from "jsonwebtoken";
import memjs, { Client } from "memjs";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import logger from "@utils/logger";

// 黑名单管理器类，用于管理 Memcached 中的黑名单
class BlacklistManager {
  private static instance: BlacklistManager;
  private memcachedClient: Client;

  // 私有构造函数，确保只能通过 getInstance 方法获取实例
  private constructor() {
    this.memcachedClient = memjs.Client.create(process.env.NODE_MEMCACHED); // 连接到本地的 Memcached 服务器
  }

  /**
   * 使用哈希函数对 key 进行哈希处理
   * @param key 
   * @returns 
  */
  private hashKey(key: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(key);
    return hash.digest('hex'); // 返回哈希值的十六进制表示形式
  }
  

  // 获取 BlacklistManager 类的唯一实例
  public static getInstance(): BlacklistManager {
    if (!BlacklistManager.instance) {
      BlacklistManager.instance = new BlacklistManager();
    }
    return BlacklistManager.instance;
  }

  /**
   * 生成 JWT 并返回 Promise
   * @param payload 有效负载数据 例如，用户ID、角色、权限等
   * @param secretKey 对 JWT 进行签名的密钥
   * @param expiresIn 指定 JWT 的过期时间 1h 表示1小时，7d 表示7天，30d 表示30天
   * @returns 
   */
  public async generateJWT(payload: any, secretKey: string, expiresIn: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, secretKey, { expiresIn }, (err, token) => {
        if (err) {
          reject(createError(500, "生成会话失败"));
        } else {
          if (token) {
            resolve(token);
          } else {
            reject(createError(500, "生成会话失败"));
          }
        }
      });
    });
  }

  /**
   * 检测token是否有效
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public authenticateJWT = async(
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const whitelistRoutes = process.env.NODE_WHITE_LIST_ROUTES ? process.env.NODE_WHITE_LIST_ROUTES.split(',') : ['']; // 定义白名单路由
    // 检查请求的路由是否在白名单中
    if (whitelistRoutes.includes(req.path)) {
      return next(); // 如果在白名单中，直接通过中间件
    }

    const token = req.headers.authorization; // 从请求头中获取 token
    const secretKey = process.env.NODE_JWTSECRETKEY;
    if (!secretKey) return next(createError(401, "会话不存在")); // 检查密钥是否存在
    if (token) {
      // 检查 token 是否在黑名单中
      blacklistManager
        .isTokenRevoked(token)
        .then((revoked) => {
          if (revoked) {
            return next(createError(401, "会话已失效")); // 如果在黑名单中，返回 401 错误
          } else {
            try {
              // 验证 token 的有效性
              const decoded = jwt.verify(token, secretKey, { ignoreExpiration: false }); // 将密钥传递给 jwt.verify 函数
              (req as any).user = decoded; // 将解码后的用户信息存储在请求对象中
              next(); // 继续请求处理
            } catch (error) {
              if (error instanceof jwt.TokenExpiredError) {
                next(createError(401, "会话已过期")); // JWT已过期 返回 401 错误
              } else {
                next(createError(401, "当前会话无效")); // 如果 token 无效，返回 401 错误
              }
            }
          }
        })
        .catch(() => {
          next(createError(500, "系统错误")); // 如果 Memcached 发生错误，返回 500 错误
        });
    } else {
      next(createError(401, "会话不存在")); // 如果没有提供 token，返回 401 错误
    }
  }

  /**
   * 检查指定 token 是否在黑名单中
   * @param token 
   * @returns 
   */
  public async isTokenRevoked(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const hashedKey = this.hashKey(token); // 使用哈希函数生成哈希值作为 key
      this.memcachedClient.get(hashedKey, (err, value) => {
        if (err) {
          reject(err); // 如果 Memcached 出错，返回 Promise.reject
        } else {
          resolve(!!value); // 返回 Promise.resolve，true 表示 token 在黑名单中
        }
      });
    });
  }

  /**
   * 将指定 token 加入黑名单
   * @param token 
   */
  public async revokeToken(token: string): Promise<void> {
    try {
      const hashedKey = this.hashKey(token); // 使用哈希函数生成哈希值作为 key
      // 将过期时间转换为秒
      const expiresInSeconds = 7 * 24 * 60 * 60; // 7天的秒数
      // 设置 token 到黑名单中，并指定过期时间
      await this.memcachedClient.set(hashedKey, "revoked", { expires: expiresInSeconds });
    } catch (error) {
      // 记录异常
      logger.error("将指定 token 加入黑名单时发生错误:", error);
      // 抛出捕获到的异常
      throw error;
    }
  }
}

export const blacklistManager = BlacklistManager.getInstance();
