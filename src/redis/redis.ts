import logger from '@utils/logger';
import Redis  from 'ioredis';
import * as RedisLib from 'ioredis';

const host: string = process.env.NODE_REDIS_HOST ? process.env.NODE_REDIS_HOST : "127.0.0.1"; // redis服务地址
const port: number = process.env.NODE_REDIS_PORT ? Number(process.env.NODE_REDIS_PORT) : 6379; // redis服务端口

class RedisClient {

    public redisClient: RedisLib.Redis;

    constructor() {
        // 创建 Redis 客户端
        this.redisClient = new Redis({
            host,
            port,
            enableOfflineQueue: false, // 禁用离线队列
            maxRetriesPerRequest: null, // 禁用重试机制
        });

        // 监听 Redis 客户端的各个事件
        this.redisClient.on('ready', () => {
            logger.error('Redis 客户端：已准备就绪');
        });
        
        this.redisClient.on('connect', () => {
            logger.error('Redis 已连接！');
        });
        
        this.redisClient.on('reconnecting', (...args: any[]) => {
            logger.error('Redis 正在重新连接', args);
        });
        
        this.redisClient.on('end', () => {
            logger.error('Redis 已关闭！');
        });
        
        this.redisClient.on('warning', (...args: any[]) => {
            logger.error('Redis 客户端警告', args);
        });
        
        this.redisClient.on('error', (err: any) => {
            logger.error('Redis 错误：' + err);
        });
        
        // 检查是否连接到 Redis
        if (this.redisClient.status === 'ready') {
            logger.error('Redis 现已连接！');
        }        
    }

    // 异步连接到 Redis
    async connect(): Promise<void> {
        await this.redisClient.connect();
    }

    // 关闭 Redis 连接
    async quit(): Promise<void> {
        await this.redisClient.quit();
    }

    // 异步检查指定键是否存在
    async exists(key: string): Promise<boolean> {
        const existsResult = await this.redisClient.exists(key);
        return !!existsResult; // 将 existsResult 转换为布尔值并返回
    }


    // 异步设置指定键的值
    async set(key: string, value: any, exprires: number): Promise<string | boolean> {
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        const result = await this.redisClient.set(key, value);
        if (!isNaN(exprires)) {
            await this.redisClient.expire(key, exprires);
        }
        return result === 'OK';
    }

    // 异步获取指定键的值
    async get(key: string): Promise<string | boolean> {
        const value = await this.redisClient.get(key);
        if (value === null) {
            return false; // 如果值为 null，则返回 false
        } else {
            return value; // 否则返回实际的值
        }
    }


    // 异步移除指定键
    async remove(key: string): Promise<number | boolean> {
        return await this.redisClient.del(key);
    }

    // 异步将值推入列表右端
    async rPush(key: string, list: string | string[], exprires: number): Promise<number | boolean> {
        // 处理参数，确保传入的参数是数组类型
        const elements: string[] = Array.isArray(list) ? list : [list];

        // 调用 rpush 方法，并传入处理后的参数数组
        const result = await this.redisClient.rpush(key, ...elements);

        // 设置过期时间
        if (!isNaN(exprires)) {
            await this.redisClient.expire(key, exprires);
        }

        return result;
    }


    // 异步获取列表指定范围的值
    async lrange(key: string, startIndex = 0, stopIndex = -1): Promise<string[] | boolean> {
        return await this.redisClient.lrange(key, startIndex, stopIndex);
    }

    // 异步清除列表中指定值的项
    async lrem(key: string, n = 1, value: string): Promise<number | boolean> {
        return await this.redisClient.lrem(key, n, value);
    }
}

// 导出 Redis 实例
export const redisInstance = new RedisClient();
