const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/customers', require('./routes/customers'));

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dodo237 ERP API' });
});

app.listen(PORT, () => {
  console.log(`dodo237 ERP server running: http://localhost:${PORT}`);
});
