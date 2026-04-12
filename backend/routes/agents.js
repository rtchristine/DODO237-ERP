const router = require('express').Router();
const pool = require('../config/db');

// GET /api/agents - list
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let idx = 1;

    if (search) {
      where.push(`(name ILIKE $${idx} OR phone ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      where.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM agents ${whereClause}`, params);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM customers c WHERE c.agent_id = a.id) as customer_count,
        (SELECT COUNT(*) FROM contracts co WHERE co.agent_id = a.id AND co.status = 'contract') as contract_count
       FROM agents a ${whereClause}
       ORDER BY a.created_at DESC
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

// GET /api/agents/all - for dropdowns (no paging)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, position, status FROM agents WHERE status = 'active' ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agents/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agents WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agents
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, position, status, hire_date } = req.body;
    const result = await pool.query(
      `INSERT INTO agents (name, phone, email, position, status, hire_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, phone, email, position || 'agent', status || 'active', hire_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/agents/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, position, status, hire_date } = req.body;
    const result = await pool.query(
      `UPDATE agents SET name=$1, phone=$2, email=$3, position=$4, status=$5, hire_date=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, phone, email, position, status, hire_date, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/agents/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
