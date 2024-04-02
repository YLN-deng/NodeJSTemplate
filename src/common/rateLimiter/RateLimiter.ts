import createError from "http-errors";
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import requestIp from 'request-ip';
import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

// 定义限流器选项的接口
interface RateLimiterOptions {
  points: number;   // 每秒允许的请求次数
  duration: number; // 限流的时间间隔（秒）
}

// 创建并返回限流器中间件的函数
const createRateLimiterMiddleware = (options: RateLimiterOptions) => {
  // 从选项中获取点数和时长
  const { points, duration } = options;
  // 创建一个新的 Redis 客户端实例
  const redisClient = new Redis({ enableOfflineQueue: false });
  // 使用 Redis 客户端创建一个 RateLimiterRedis 实例
  const rateLimiterRedis = new RateLimiterRedis({
    storeClient: redisClient,
    points,     // 每秒允许的请求次数
    duration,   // 限流的时间间隔（秒）
  });

  // 返回一个异步函数作为 Express 中间件
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 获取客户端 IP 地址
      const clientIp = requestIp.getClientIp(req) || '';
      // 使用客户端 IP 地址进行请求限流
      await rateLimiterRedis.consume(clientIp);
      // 如果未触发限流，继续执行下一个中间件
      next();
    } catch (error:any) {
      // 处理限流器错误
      if (error.remainingPoints === 0) {
        // 如果触发了限流，返回状态码 429 和错误信息
        next(createError(429,"操作过于频繁"))
      } else {
        // 如果是其他类型的错误，返回状态码 500 和错误信息
        logger.error('Rate limiter middleware error:', error);
        next(createError(500,"系统错误"))
      }
    }
  };
};

// 导出创建限流器中间件的函数
export default createRateLimiterMiddleware;
