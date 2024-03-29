import winston from "winston";

// 自定义时间戳格式化器，将时间戳信息转换为上海时间
const customTimestamp = winston.format((info, opts) => {
    // 检查时间戳信息是否有效，如果无效则使用当前时间
    const timestamp = info.timestamp && !isNaN(Date.parse(info.timestamp)) ? info.timestamp : new Date().toISOString();

    // 使用toLocaleString方法将UTC时间转换为上海时间
    const shanghaiDate = new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Shanghai" });

    // 将转换后的时间设置为新的时间戳信息
    info.timestamp = shanghaiDate;

    return info;
});

// 配置Winston日志记录器选项
const options: winston.LoggerOptions = {
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug",
            format: winston.format.combine(
                customTimestamp(), // 使用自定义时间戳格式化器
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                }),
                winston.format.json() // 将日志记录为 JSON 格式
            )
        }),
        new winston.transports.File({ 
            filename: "debug.log", 
            level: "debug",
            format: winston.format.combine(
                customTimestamp(), // 使用自定义时间戳格式化器
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                }),
                winston.format.json() // 将日志记录为 JSON 格式
            )
        })
    ]
};

// 创建Winston日志记录器
const logger = winston.createLogger(options);

// 在非生产环境下打印调试信息
if (process.env.NODE_ENV !== "production") {
    logger.debug("development :>> 初始化日志记录");
}

export default logger;
