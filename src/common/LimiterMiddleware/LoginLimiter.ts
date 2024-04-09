import createError from "http-errors";
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisInstance } from '@redis/redis';
import requestIp from 'request-ip';
import logger from '../../utils/logger';
import { authorise } from '@controller/auth/authorise';

const maxWrongAttemptsByIPperDay = process.env.NODE_LOGIN_NUMBER_OF_ERRORS_IP?Number(process.env.NODE_LOGIN_NUMBER_OF_ERRORS_IP):100; //IP 每日最大错误尝试次数
const maxConsecutiveFailsByUsernameAndIP = process.env.NODE_LOGIN_NUMBER_OF_ERRORS_USER_IP?Number(process.env.NODE_LOGIN_NUMBER_OF_ERRORS_USER_IP):10; //按用户名和 IP 划分的最大连续失败数

// 使用 Redis 实例创建限流器对象 limiterSlowBruteByIP
const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisInstance.redisClient, // 使用 Redis 实例作为存储客户端
  keyPrefix: 'login_fail_ip_per_day',     // 键的前缀，用于标识此限流器
  points: maxWrongAttemptsByIPperDay,     // 每秒允许的最大点数（请求次数）
  duration: 60 * 60 * 24,                 // 限流的时间间隔，单位为秒，这里是一天
  blockDuration: 60 * 60 * 24,            // 如果每天 100 次错误尝试，则阻止 1 天
});
  
// 使用 Redis 实例创建限流器对象 limiterConsecutiveFailsByUsernameAndIP
const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisInstance.redisClient,                   // 使用 Redis 实例作为存储客户端
  keyPrefix: 'login_fail_consecutive_username_and_ip',      // 键的前缀，用于标识此限流器
  points: maxConsecutiveFailsByUsernameAndIP,               // 每秒允许的最大点数（请求次数）
  duration: 60 * 60 * 24 * 90,                              // 限流的时间间隔，单位为秒，这里是 90 天
  blockDuration: 60 * 60,                                   // 如果连续失败，则阻止用户 1 小时
});
  
/**
 * 作用：格式化数据
 * @param username 用户账号
 * @param ip //地址
 * @returns 对应字符串
 */
const getUsernameIPkey = (username:string, ip:string) => `${username}_${ip}`;

/**
 * 作用：登录限流
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const loginRoute = async (req:Request, res:Response,next:NextFunction) => {
  const ipAddr = requestIp.getClientIp(req) || '127.0.0.1'; //获取客户端的 IP 地址
  const usernameIPkey = getUsernameIPkey(req.body.account, ipAddr); //生成一个唯一的键值

  /**
   * @resUsernameAndIP 获取与用户名和 IP 地址相关的失败次数
   * @resSlowByIP 获取与 IP 地址相关的失败次数
   */
  const [resUsernameAndIP, resSlowByIP] = await Promise.all([
    limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
    limiterSlowBruteByIP.get(ipAddr),
  ]);

  let retrySecs = 0; //初始化变量retrySecs为0,用于存储重试的秒数

  // 检查IP或用户名+IP是否已被阻止
  if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) { 
    // IP 地址相关的失败次数超过了每天允许的最大错误尝试次数（maxWrongAttemptsByIPperDay），则对请求进行限流或阻止
    // 据距离下一次重试的时间间隔（msBeforeNext）计算出重试的秒数，并将其赋值给 retrySecs
    retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
  } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
    // 如果与 IP 地址相关的限流情况未触发限流条件，则检查与用户名和 IP 地址相关的限流情况
    // 用户名和 IP 地址相关的失败次数超过了设定的最大连续失败次数（maxConsecutiveFailsByUsernameAndIP），则同样对请求进行限流或阻止
    retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
  }

  // retrySecs大于 0，限流或阻止请求
  if (retrySecs > 0) {
    res.set('Retry-After', String(retrySecs));
    return next(createError(429,`请${Math.ceil(retrySecs/60)}分钟后再试`));
  } else {
    const user = await authorise(req.body.account, req.body.password); // should be implemented in your project
    if (!user.isLoggedIn) {//用户账号密码错误
      // 错误尝试时从限制器中消耗 1 点，如果达到限制则阻止
      try {
        const promises = [limiterSlowBruteByIP.consume(ipAddr)];
        if (user.exists) {
          // 仅针对注册用户按用户名 + IP 计算失败尝试次数
          promises.push(limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
        }

        await Promise.all(promises); // 执行promises

        // 是否存在返回信息
        if(user.message) {
          return next(createError(400,user.message));
        }else {
          return next(createError(400,"填写信息错误"));
        }
      } catch (rlRejected:any) {
        if (rlRejected instanceof Error) {
          logger.error("登录守护抛出异常：",rlRejected);
          throw rlRejected;
        } else {
          res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || '1');
          return next(createError(429,`请${Math.ceil(Math.round(rlRejected.msBeforeNext / 1000) / 60) || '1'}分钟后再试`));
        }
      }
    }

    // 用户成功登录：重置与用户名 + IP 地址组合相关的失败次数
    if (user.isLoggedIn) {
      if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
        // 身份验证成功后重置
        await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
      }

      // 返回成功登录信息token
      return (res as any).AjaxResult.success(200,user.token);
    }
  }
}

export {
  loginRoute
}
