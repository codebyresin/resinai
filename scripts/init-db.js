const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * 该脚本用于一键初始化本地 MySQL 数据库。
 * 它会先连接到 MySQL 服务器，然后创建名为 'resinAi' 的数据库，
 * 接着在该数据库中创建所有必要的表结构。
 */

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

async function init() {
  loadEnv();
  
  // 1. 先连接到 MySQL (不指定数据库名，因为我们要先创建它)
  const connectionConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
  };

  const dbName = process.env.MYSQL_DATABASE || 'resinAi';

  console.log('🚀 开始连接 MySQL...');

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ 已成功连接到 MySQL 服务器。');

    // 2. 创建数据库
    console.log(`🔨 正在创建数据库 '${dbName}'...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 '${dbName}' 已就绪。`);

    // 3. 切换到新创建的数据库
    await connection.changeUser({ database: dbName });

    // 4. 创建用户表 (users)
    console.log('🔨 正在创建 users 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. 创建登录验证码表 (email_login_codes)
    console.log('🔨 正在创建 email_login_codes 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_login_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. 创建重置密码验证码表 (password_reset_codes)
    console.log('🔨 正在创建 password_reset_codes 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('\n✨ 数据库初始化成功！你可以开始进行登录和对话测试了。');

    await connection.end();
  } catch (err) {
    console.error('\n❌ 初始化失败：', err.message);
    console.log('\n💡 请确保：');
    console.log('1. 你本地已安装 MySQL 且正在运行。');
    console.log(`2. '.env' 中的用户名 (${connectionConfig.user}) 和密码 是否正确。`);
  }
}

init();
