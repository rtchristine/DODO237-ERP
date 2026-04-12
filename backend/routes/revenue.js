const router = require('express').Router();
const pool = require('../config/db');

// GET /api/revenue - list with filters
router.get('/', async (req, res) => {
  try {
    const { search, payment_status, period_year, period_month, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let idx = 1;

    if (search) {
      where.push(`(a.name ILIKE $${idx} OR cu.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (payment_status) { where.push(`r.payment_status = $${idx}`); params.push(payment_status); idx++; }
    if (period_year) { where.push(`r.period_year = $${idx}`); params.push(period_year); idx++; }
    if (period_month) { where.push(`r.period_month = $${idx}`); params.push(period_month); idx++; }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM revenue r
       LEFT JOIN agents a ON r.agent_id = a.id
       LEFT JOIN contracts co ON r.contract_id = co.id
       LEFT JOIN customers cu ON co.customer_id = cu.id
       ${whereClause}`, params
    );

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT r.*, a.name as agent_name, co.insurance_company, co.premium,
              cu.name as customer_name, cu.car_number
       FROM revenue r
       LEFT JOIN agents a ON r.agent_id = a.id
       LEFT JOIN contracts co ON r.contract_id = co.id
       LEFT JOIN customers cu ON co.customer_id = cu.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`, params
    );

    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/revenue/stats
router.get('/stats', async (req, res) => {
  try {
    const { period_year, period_month } = req.query;
    let yearFilter = period_year || new Date().getFullYear();
    let monthFilter = period_month || (new Date().getMonth() + 1);

    const stats = await pool.query(`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'paid'), 0) as total_paid,
        COALESCE(SUM(amount) FILTER (WHERE payment_status = 'pending'), 0) as total_pending,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_count,
        COALESCE(SUM(amount) FILTER (WHERE period_year = $1 AND period_month = $2 AND payment_status = 'paid'), 0) as monthly_paid
      FROM revenue
    `, [yearFilter, monthFilter]);
    res.json(stats.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/revenue
router.post('/', async (req, res) => {
  try {
    const { contract_id, agent_id, revenue_type, amount, commission_rate, payment_status, payment_date, period_year, period_month, memo } = req.body;
    const result = await pool.query(
      `INSERT INTO revenue (contract_id, agent_id, revenue_type, amount, commission_rate, payment_status, payment_date, period_year, period_month, memo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [contract_id, agent_id, revenue_type || 'commission', amount || 0, commission_rate || 0, payment_status || 'pending', payment_date, period_year, period_month, memo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/revenue/:id
router.put('/:id', async (req, res) => {
  try {
    const { contract_id, agent_id, revenue_type, amount, commission_rate, payment_status, payment_date, period_year, period_month, memo } = req.body;
    const result = await pool.query(
      `UPDATE revenue SET contract_id=$1, agent_id=$2, revenue_type=$3, amount=$4, commission_rate=$5,
       payment_status=$6, payment_date=$7, period_year=$8, period_month=$9, memo=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [contract_id, agent_id, revenue_type, amount, commission_rate, payment_status, payment_date, period_year, period_month, memo, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/revenue/:id/status - payment status change
router.put('/:id/status', async (req, res) => {
  try {
    const { payment_status, payment_date } = req.body;
    const result = await pool.query(
      `UPDATE revenue SET payment_status=$1, payment_date=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [payment_status, payment_date || new Date(), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/revenue/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM revenue WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
