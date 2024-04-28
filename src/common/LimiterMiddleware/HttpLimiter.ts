import createError from 'http-errors'
import { Request, Response, NextFunction } from 'express';
import requestIp from 'request-ip';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { redisInstance } from '@redis/redis';

const rateLimiterMemory = new RateLimiterMemory({
    points: 100, // 如果总共有 2 个进程，则为 200 / 2
    duration: 60,
});

const rateLimiterRedis = new RateLimiterRedis({
    storeClient: redisInstance.redisClient,
    points: 200,                            // 每个时间段的点数
    duration: 60,                           // 时间段（秒）
    inMemoryBlockOnConsumed: 201,           // 如果某个用户或IP地址在一分钟内消耗的点数超过了 201，那么将立即被阻止
    inMemoryBlockDuration: 60,              // 在内存中阻塞一分钟，这样就没有请求发送到 Redis
    insuranceLimiter: rateLimiterMemory,
});

const rateLimiterRedisReports = new RateLimiterRedis({
    keyPrefix: 'rlreports',
    storeClient: redisInstance.redisClient,
    points: 10,   // 每个用户的报告仅获得 10 分
    duration: 60, // 每 60 秒
});

// 报告请求频率限制
const allowedPaths = process.env.NODE_REPORT_REQUEST_LIMITS?process.env.NODE_REPORT_REQUEST_LIMITS.split(','):[''];

const HttpLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 根据情况选择使用用户ID还是IP地址作为速率限制的键
    const key = (req as any)?.user?.user_id ?? requestIp.getClientIp(req);

    // 检查请求路径，根据不同的路径选择不同的速率限制策略
    if (allowedPaths.includes(req.path)) {
         // 如果请求路径以 '/report' 开头，使用报告频率限制器
        const pointsToConsume = (req as any)?.user?.user_id ? 1 : 5; //如果 req.userId 存在，则消耗 1分。否则，消耗 5分。
        rateLimiterRedisReports.consume(key, pointsToConsume)
            .then(() => {
                next(); // 请求通过，继续处理下一个中间件或路由处理程序
            })
            .catch(_ => {
                next(createError(429,"请求过于频繁"))  // 请求过多，返回 429 Too Many Requests
            });
    } else {
        // 对于其他路径，使用普通频率限制器
        const pointsToConsume = (req as any)?.user?.user_id ? 1 : 30; //如果 req.userId 存在，则消耗 1分。否则，消耗 30分。
        rateLimiterRedis.consume(key, pointsToConsume)
            .then(() => {
                next();
            })
            .catch(_ => {
                next(createError(429,"请求过于频繁")) 
            });
    }
}

// 导出接口请求限流器中间件的函数
export default HttpLimiterMiddleware;
