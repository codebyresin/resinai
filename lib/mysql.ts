import mysql from "mysql2/promise"; // 引入支持异步(Promise)的 MySQL 驱动

// 创建数据库连接池，这是后端开发的标准做法
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, // 数据库地址
  user: process.env.MYSQL_USER, // 用户名
  password: process.env.MYSQL_PASSWORD, // 密码
  database: process.env.MYSQL_DATABASE, // 数据库名
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数（连接池大小）
  queueLimit: 0,
});
