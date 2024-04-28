import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import nodemailer, { Transporter } from 'nodemailer';
import Queue, { QueueOptions } from 'bull';
import logger from './logger';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisInstance } from '@redis/redis';

// 创建一个邮件传输器实例
const transporter: Transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODE_QQEMAIL_USER || '', // QQ邮箱地址
        pass: process.env.NODE_QQEMAIL_CODE || '' // QQ邮箱授权码
    }
});

// 创建 Bull 队列
const emailQueue = new Queue('emailQueue', {
    defaultJobOptions: {
        concurrency: 100,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        ttl: 24 * 60 * 60 * 1000
    }
} as QueueOptions);

// 创建 RateLimiter，每 60 秒请求一次
const rateLimiter = new RateLimiterRedis({
    storeClient: redisInstance.redisClient,
    keyPrefix: 'emailThrottle',
    points: 1,                          // 每次请求消耗的点数
    duration: 60,                       // 限流时间间隔为 60 秒
    blockDuration: 60,                  // 如果连续请求，则阻止用户 60 秒
    inMemoryBlockOnConsumed: 1          // 设置为 1，但要确保在其他地方 points 的值也为 1
});

// 创建 rateLimiterDay，每天只能请求 100 次
const rateLimiterDay = new RateLimiterRedis({
    storeClient: redisInstance.redisClient,
    keyPrefix: 'emailThrottleDay',
    points: 100,                        // 每天允许的请求次数
    duration: 24 * 60 * 60,             // 限流时间间隔为 1 天
    blockDuration: 24 * 60 * 60,        // 如果连续请求，则阻止用户 1 天
});

// 添加发送邮件任务到队列中，并添加节流限制
emailQueue.process(async (job) => {
    // 解构从队列中获取的数据
    const { receiverEmail, subject, html } = job.data;
    try {
        // 邮件选项
        const mailOptions = {
            from: `"ogcfun" <${process.env.NODE_QQEMAIL_USER || ''}>`,
            to: receiverEmail,
            subject: subject,
            html: html
        };

        // 发送邮件并等待结果
        const info = await transporter.sendMail(mailOptions);

        // 返回包含邮件ID
        return { messageId: info.messageId };
    } catch (error) {
        logger.error('发送邮件时出错：', error);
        throw new Error('发送邮件失败');
    }
});

// 发送邮件函数，带有节流限制和每日请求次数限制
export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    const receiverEmail: string = req.body.email;
    const subject: string = 'OGC图库验证码';

    const reqId = receiverEmail; // 获取用户邮箱为限制对象

    try {
        // 获取每分钟和每天的限流信息
        const [resLimiter, resLimiterDay] = await Promise.all([
            rateLimiter.get(reqId),
            rateLimiterDay.get(reqId),
        ]);

        let retrySecs = 0; //初始化变量retrySecs为0,用于存储重试的秒数

        if (resLimiter !== null && resLimiter.consumedPoints > 1) {
            retrySecs = Math.round(resLimiter.msBeforeNext / 1000) || 1;
        } else if (resLimiterDay !== null && resLimiterDay.consumedPoints > 100) {
            retrySecs = Math.round(resLimiterDay.msBeforeNext / 1000) || 1;
        }

        // retrySecs大于 0，限流或阻止请求
        if (retrySecs > 0 && retrySecs <= 60) {
            res.set('Retry-After', String(retrySecs));
            return next(createError(429, `请在 ${Math.ceil(retrySecs)} 秒后重新发送`));
        } else if (retrySecs > 60) {
            res.set('Retry-After', String(retrySecs));
            return next(createError(429, `请在 ${Math.ceil(retrySecs / 60 / 60)} 小时后重新发送`));
        } else {
            // 消费每分钟和每天的点数
            await rateLimiterDay.consume(reqId);
            await rateLimiter.consume(reqId);

            // 生成验证码
            const verificationCode = generateVerificationCode();

            // 存储到redis，时间为5分钟
            await redisInstance.set(receiverEmail, verificationCode, 60 * 5)

            // 生成的邮件 HTML
            const html: string = generateEmailHTML(verificationCode);

            // 添加发送邮件任务到队列中
            const job = await emailQueue.add({ receiverEmail, subject, html });
            
            // 等待任务完成，并接收返回值
            await job.finished();

            // 响应http
            return (res as any).AjaxResult.success(200, verificationCode);
        }
    } catch (error: any) {
        if (error instanceof Error) {
            logger.error('发送邮件时出错：', error);
            return next(createError(500, '发送邮件失败'));
        } else {
            res.set('Retry-After', String(Math.round(error.msBeforeNext / 1000)) || '1');
            return next(createError(429, `请在 ${Math.ceil(Math.round(error.msBeforeNext / 1000))} 秒后重新发送`));
        }
    }
};

// 生成随机6位数的数字验证码
function generateVerificationCode() {
    const min = 100000; // 最小值为100000（即6位数）
    const max = 999999; // 最大值为999999（即6位数）
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
}

function generateEmailHTML(verificationCode: string) {
    // 创建邮件 HTML 内容
    const emailHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OGC图库验证码</title>
    </head>
    <style>
        /* 设置全局样式 */
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
        }
        /* 设置邮件容器样式 */
        .email-container {
            max-width: 600px;
            margin: 10px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        /* 设置标题样式 */
        .email-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 30px;
            padding-left: 10px;
        }
        /* 设置内容样式 */
        .email-content {
            font-size: 16px;
            color: #666;
            line-height: 1.6;
            padding-left: 10px;
        }
        /* 设置标题样式 */
        .logo-title {
            font-size: 28px;
            color: #333;
            text-align: center;
        }
        /* 设置内容样式 */
        .code-content {
            font-size: 16px;
            color: #000000;
            line-height: 1.6;
            text-align: center;
            font-size: 32px;
            letter-spacing: 2px; /* 调整字符之间的间距*/
            border-bottom: 1px dashed #666; /* 添加下划线效果 */
        }
        /* 设置内容样式 */
        .tip-content {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
            padding-left: 10px;
        }
    </style>
    </head>
    <body>
    <div>
        <div class="email-container">
            <div>
                <p class="logo-title">Ogcfun Gallery</p>
                <p class="email-title">邮箱验证码</p>
                <p class="email-content">尊敬的用户您好！</p>
                <p class="email-content">请填写以下验证码完成邮箱验证 (5分钟内有效)</p>
                <p class="code-content"><strong>${verificationCode}</strong></p>
                <p class="tip-content">如果该验证码不为您本人申请，请无视。</p>
                <p class="tip-content">(本邮件由系统自动发出，请勿直接回复)</p>
            </div>
        </div>
    </div>
    </body>
    </html>
    `;

    return emailHTML;
}
