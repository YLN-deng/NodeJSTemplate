import createError from 'http-errors'
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import requestIp from 'request-ip';
import bodyParser from 'body-parser';

import dotenv from "dotenv";
dotenv.config({ path: ".env." + process.env.NODE_ENV });

const app = express();

import {blacklistManager} from '@common/BlacklistManager/BlacklistManager';
import ajaxResultMiddleware from '@common/Result/AjaxResult';
import IpLimiterMiddleware from '@common/LimiterMiddleware/IPLimiter';
import HttpLimiterMiddleware from '@common/LimiterMiddleware/HttpLimiter';

import indexRouter from './routes/index';
import authRouter from './routes/auth';
import usersRouter from './routes/users';

/**
 * 获取客户端IP地址的中间件
 */
app.use(requestIp.mw());

/**
 * logger('dev') 中间件，它是 Morgan 模块提供的一个预定义日志格式，可以在控制台中打印出请求日志，便于开发时查看请求信息。
 */
app.use(logger('dev'));

/**
 * 将 Express 应用程序配置为使用内置的中间件来解析 JSON 格式的请求体数据。
 * limit:300kb 设置请求体的大小限制为 300kb
 */
app.use(express.json({ limit: '300kb' }));

/**
 * 配置 Express 应用程序使用内置中间件来解析 URL 编码的请求体数据
 */
app.use(express.urlencoded({ extended: false }));

/**
 *  解析body请求体数据
 */
app.use(bodyParser.json({ limit: '300kb' }));


/**
 * 配置 Express 应用程序使用 cookie-parser 中间件来解析请求中的 cookie 数据。
 */
app.use(cookieParser());

/**
 * 使用中间件来添加 AjaxResult 方法到响应对象上
 */
app.use(ajaxResultMiddleware);

/**
 * JWT 中间件，用于验证 token
 */
app.use(blacklistManager.authenticateJWT);

/**
 * IP速率限制器中间件
 * @points 每秒允许的请求次数
 * @duration 限流的时间间隔（秒）
 */ 
app.use(IpLimiterMiddleware({points: 10, duration: 1}));

/**
 * 请求接口速率限制器中间件
 */
app.use(HttpLimiterMiddleware);

/**
 * 路由配置
 */
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users',usersRouter);

/**
 * 捕获 404 错误对象
 */
app.use((req:Request, res:Response, next:NextFunction) => {
  next(createError(404, "请求地址无效"));
});

// 错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // 设置响应头为 JSON 格式
  res.setHeader('Content-Type', 'application/json');
  // 返回 JSON 错误响应
  (res as any).AjaxResult.bizFail(err.status || 500, err.message || "系统错误");
});

export default app;
