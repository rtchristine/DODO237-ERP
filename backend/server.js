const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/proxy', require('./routes/proxy'));

// health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dodo237 ERP API',
    modules: ['customers', 'contracts', 'agents', 'revenue', 'quotes', 'proxy']
  });
});

app.listen(PORT, () => {
  console.log(`dodo237 ERP server running: http://localhost:${PORT}`);
});
