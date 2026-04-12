const router = require('express').Router();
const pool = require('../config/db');

// GET /api/contracts - list with search, filter, paging
router.get('/', async (req, res) => {
  try {
    const { search, status, quote_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let idx = 1;

    if (search) {
      where.push(`(cu.name ILIKE $${idx} OR cu.car_number ILIKE $${idx} OR co.insurance_company ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      where.push(`co.status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (quote_type) {
      where.push(`co.quote_type = $${idx}`);
      params.push(quote_type);
      idx++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM contracts co
       LEFT JOIN customers cu ON co.customer_id = cu.id
       ${whereClause}`, params
    );

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT co.*, cu.name as customer_name, cu.car_number, cu.phone as customer_phone,
              a.name as agent_name
       FROM contracts co
       LEFT JOIN customers cu ON co.customer_id = cu.id
       LEFT JOIN agents a ON co.agent_id = a.id
       ${whereClause}
       ORDER BY co.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`, params
    );

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/stats - dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'quote') as quote_count,
        COUNT(*) FILTER (WHERE status = 'contract') as contract_count,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
        COALESCE(SUM(premium) FILTER (WHERE status = 'contract'), 0) as total_premium
      FROM contracts
    `);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/:id - detail
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT co.*, cu.name as customer_name, cu.car_number, cu.phone as customer_phone,
              a.name as agent_name
       FROM contracts co
       LEFT JOIN customers cu ON co.customer_id = cu.id
       LEFT JOIN agents a ON co.agent_id = a.id
       WHERE co.id = $1`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/contracts - create
router.post('/', async (req, res) => {
  try {
    const { customer_id, agent_id, quote_type, insurance_company, premium,
            discount_rate, coverage_type, driver_range, age_range,
            insurance_period, previous_company, status, contract_date,
            start_date, end_date, memo } = req.body;
    const result = await pool.query(
      `INSERT INTO contracts (customer_id, agent_id, quote_type, insurance_company, premium,
       discount_rate, coverage_type, driver_range, age_range, insurance_period,
       previous_company, status, contract_date, start_date, end_date, memo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [customer_id, agent_id, quote_type, insurance_company, premium,
       discount_rate, coverage_type, driver_range, age_range, insurance_period,
       previous_company, status || 'quote', contract_date, start_date, end_date, memo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contracts/:id - update
router.put('/:id', async (req, res) => {
  try {
    const { customer_id, agent_id, quote_type, insurance_company, premium,
            discount_rate, coverage_type, driver_range, age_range,
            insurance_period, previous_company, status, contract_date,
            start_date, end_date, memo } = req.body;
    const result = await pool.query(
      `UPDATE contracts SET customer_id=$1, agent_id=$2, quote_type=$3, insurance_company=$4,
       premium=$5, discount_rate=$6, coverage_type=$7, driver_range=$8, age_range=$9,
       insurance_period=$10, previous_company=$11, status=$12, contract_date=$13,
       start_date=$14, end_date=$15, memo=$16, updated_at=NOW()
       WHERE id=$17 RETURNING *`,
      [customer_id, agent_id, quote_type, insurance_company, premium,
       discount_rate, coverage_type, driver_range, age_range, insurance_period,
       previous_company, status, contract_date, start_date, end_date, memo, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contracts/:id/status - update status only
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE contracts SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contracts/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contracts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
