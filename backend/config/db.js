const { Pool } = require('pg');

// PostgreSQL 연결 풀
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dodo237_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'dodo237db',
});

// 연결 테스트
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
  } else {
    console.log('DB 연결 성공: dodo237_erp');
  }
});

module.exports = pool;
