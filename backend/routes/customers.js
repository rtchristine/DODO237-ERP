const router = require('express').Router();
const pool = require('../config/db');

// GET /api/customers - 고객 목록 (검색, 페이징)
router.get('/', async (req, res) => {
  try {
    const { search, agent_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let idx = 1;

    if (search) {
      where.push(`(c.name ILIKE $${idx} OR c.car_number ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (agent_id) {
      where.push(`c.agent_id = $${idx}`);
      params.push(agent_id);
      idx++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM customers c ${whereClause}`, params
    );

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT c.*, a.name as agent_name 
       FROM customers c 
       LEFT JOIN agents a ON c.agent_id = a.id
       ${whereClause}
       ORDER BY c.created_at DESC 
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

// GET /api/customers/:id - 고객 상세
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, a.name as agent_name 
       FROM customers c 
       LEFT JOIN agents a ON c.agent_id = a.id
       WHERE c.id = $1`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers - 고객 등록
router.post('/', async (req, res) => {
  try {
    const { name, phone, car_number, car_model, car_year, birthdate, gender, address, memo, agent_id, source } = req.body;
    const result = await pool.query(
      `INSERT INTO customers (name, phone, car_number, car_model, car_year, birthdate, gender, address, memo, agent_id, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, phone, car_number, car_model, car_year, birthdate, gender, address, memo, agent_id, source]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id - 고객 수정
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, car_number, car_model, car_year, birthdate, gender, address, memo, agent_id, source } = req.body;
    const result = await pool.query(
      `UPDATE customers SET name=$1, phone=$2, car_number=$3, car_model=$4, car_year=$5, 
       birthdate=$6, gender=$7, address=$8, memo=$9, agent_id=$10, source=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [name, phone, car_number, car_model, car_year, birthdate, gender, address, memo, agent_id, source, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id - 고객 삭제
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
