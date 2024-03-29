// 导入mysql模块
import mysql from "mysql";

// 创建数据库连接对象
const db = mysql.createPool({
  host: process.env.NODE_HOST,
  user: process.env.NODE_USER_NAME,
  password: process.env.NODE_PASSWORD,
  database: process.env.NODE_DATABASE,
});

// 向外共享db数据库连接对象
export default db;