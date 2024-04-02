// 导入sequelize模块
import {Sequelize} from 'sequelize';
import logger from '@utils/logger';

const host = process.env.NODE_HOST;
const username = process.env.NODE_USER_NAME;
const password = process.env.NODE_PASSWORD;
const database = process.env.NODE_DATABASE;

if (!host || !username || !password || !database) {
  logger.error('缺少数据库连接所需的环境变量');
  process.exit(1); // 退出应用程序或执行适当的错误处理
}

// 创建数据库连接对象
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: 'mysql',
});

// 向外共享db数据库连接对象
export default sequelize;
