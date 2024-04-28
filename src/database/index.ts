// 导入 TypeORM 模块
import { DataSource } from "typeorm";
import logger from "@utils/logger";

// 从环境变量中获取数据库连接信息
const host = process.env.NODE_HOST;
const username = process.env.NODE_USER_NAME;
const password = process.env.NODE_PASSWORD;
const database = process.env.NODE_DATABASE;

// 检查环境变量是否完整
if (!host || !username || !password || !database) {
  logger.error("缺少数据库连接所需的环境变量");
  process.exit(1); // 退出应用程序或执行适当的错误处理
}

// 创建 TypeORM 连接配置选项
const connection = new DataSource({
  type: "mysql",
  host: host,
  port: 3306,
  username: username,
  password: password,
  database: database,
  entities: ["src/apps/models/*.ts"],
  logging: true, //启用日志记录
  synchronize: false, //自动创建数据库架构
  isolateWhereStatements:true //启用 where 语句隔离
});

connection
  .initialize()
  .then(() => {
    logger.debug("数据源已初始化！");
  })
  .catch((err) => {
    logger.error("数据源初始化期间出错：", err);
  });

// 向外共享db数据库连接对象
export default connection;
