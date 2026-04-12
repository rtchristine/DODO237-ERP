const router = require('express').Router();

// proxy target URL (configurable via .env)
const PROXY_TARGET = process.env.PROXY_URL || 'http://localhost:5050';

// GET /api/proxy/status - check external API connection
router.get('/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${PROXY_TARGET}/api/status`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    res.json({ connected: true, data });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

// GET /api/proxy/carcode/search?q=keyword - car code search
router.get('/carcode/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const response = await fetch(`${PROXY_TARGET}/api/carcode/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Car code API unavailable', detail: err.message });
  }
});

// GET /api/proxy/carcode/:code - car code detail lookup
router.get('/carcode/:code', async (req, res) => {
  try {
    const response = await fetch(`${PROXY_TARGET}/api/carcode/${req.params.code}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Car code API unavailable', detail: err.message });
  }
});

// POST /api/proxy/calculate - insurance premium calculation
router.post('/calculate', async (req, res) => {
  try {
    const response = await fetch(`${PROXY_TARGET}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Calculate API unavailable', detail: err.message });
  }
});

module.exports = router;
