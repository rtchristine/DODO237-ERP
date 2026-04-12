const router = require('express').Router();
const pool = require('../config/db');

// GET /api/quotes - list with search, filter, paging
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = [];
    let params = [];
    let idx = 1;

    if (search) {
      where.push(`(q.insured_name ILIKE $${idx} OR q.car_number ILIKE $${idx} OR q.car_name ILIKE $${idx} OR q.phone ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      where.push(`q.status = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM quotes q ${whereClause}`, params
    );

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT q.*, c.name as customer_db_name, a.name as agent_name
       FROM quotes q
       LEFT JOIN customers c ON q.customer_id = c.id
       LEFT JOIN agents a ON q.agent_id = a.id
       ${whereClause}
       ORDER BY q.created_at DESC
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

// GET /api/quotes/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COUNT(*) FILTER (WHERE status = 'calculated') as calculated_count,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
        COUNT(*) FILTER (WHERE status = 'contracted') as contracted_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count
      FROM quotes
    `);
    res.json(stats.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.name as customer_db_name, a.name as agent_name
       FROM quotes q
       LEFT JOIN customers c ON q.customer_id = c.id
       LEFT JOIN agents a ON q.agent_id = a.id
       WHERE q.id = $1`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes
router.post('/', async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(
      `INSERT INTO quotes (
        customer_id, agent_id, person_type, insured_name, jumin,
        corp_name, biz_no, corp_no, ceo_name, phone,
        prev_company, prev_premium, driver_range, age_limit,
        driver_name, driver_birth, driver_gender,
        car_code, car_name, car_number, car_year, car_price,
        cc, car_grade, people, sports,
        airbag, abs_yn, steal_yn, transmission, fuel_type, outset_date,
        dambo_d2, dambo_dm, dambo_js, dambo_mu, dambo_jc, dambo_em,
        insurance_start, insurance_end,
        career_ins, career_car, prev_3yr, halin_grade,
        traffic_code, traffic_count, car_count, muljuk,
        acci_3yr, acci_1yr, acci_score,
        discount_tags, map_type, map_score, mileage,
        hd_special, samsung_3yr, meritz_3yr,
        parts_total, parts_detail, result_data, status, memo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
        $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
        $51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62
      ) RETURNING *`,
      [
        d.customer_id||null, d.agent_id||null, d.person_type||'personal', d.insured_name, d.jumin||null,
        d.corp_name||null, d.biz_no||null, d.corp_no||null, d.ceo_name||null, d.phone||null,
        d.prev_company||null, d.prev_premium||0, d.driver_range||null, d.age_limit||null,
        d.driver_name||null, d.driver_birth||null, d.driver_gender||null,
        d.car_code||null, d.car_name||null, d.car_number||null, d.car_year||null, d.car_price||0,
        d.cc||0, d.car_grade||null, d.people||null, d.sports||null,
        d.airbag||'0', d.abs_yn||'0', d.steal_yn||'0', d.transmission||null, d.fuel_type||null, d.outset_date||null,
        d.dambo_d2||null, d.dambo_dm||null, d.dambo_js||null, d.dambo_mu||null, d.dambo_jc||null, d.dambo_em||null,
        d.insurance_start||null, d.insurance_end||null,
        d.career_ins||'B5', d.career_car||'B5', d.prev_3yr||'4', d.halin_grade||'13Z',
        d.traffic_code||'C012', d.traffic_count||0, d.car_count||1, d.muljuk||200,
        d.acci_3yr||0, d.acci_1yr||0, d.acci_score||0,
        JSON.stringify(d.discount_tags||{}), d.map_type||'0', d.map_score||'0', d.mileage||'0',
        d.hd_special||'h01', d.samsung_3yr||null, d.meritz_3yr||'B5',
        d.parts_total||0, JSON.stringify(d.parts_detail||{}),
        JSON.stringify(d.result_data||[]), d.status||'draft', d.memo||null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/quotes/:id
router.put('/:id', async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(
      `UPDATE quotes SET
        customer_id=$1, agent_id=$2, person_type=$3, insured_name=$4, jumin=$5,
        corp_name=$6, biz_no=$7, corp_no=$8, ceo_name=$9, phone=$10,
        prev_company=$11, prev_premium=$12, driver_range=$13, age_limit=$14,
        driver_name=$15, driver_birth=$16, driver_gender=$17,
        car_code=$18, car_name=$19, car_number=$20, car_year=$21, car_price=$22,
        cc=$23, car_grade=$24, people=$25, sports=$26,
        airbag=$27, abs_yn=$28, steal_yn=$29, transmission=$30, fuel_type=$31, outset_date=$32,
        dambo_d2=$33, dambo_dm=$34, dambo_js=$35, dambo_mu=$36, dambo_jc=$37, dambo_em=$38,
        insurance_start=$39, insurance_end=$40,
        career_ins=$41, career_car=$42, prev_3yr=$43, halin_grade=$44,
        traffic_code=$45, traffic_count=$46, car_count=$47, muljuk=$48,
        acci_3yr=$49, acci_1yr=$50, acci_score=$51,
        discount_tags=$52, map_type=$53, map_score=$54, mileage=$55,
        hd_special=$56, samsung_3yr=$57, meritz_3yr=$58,
        parts_total=$59, parts_detail=$60, result_data=$61, status=$62, memo=$63,
        updated_at=NOW()
      WHERE id=$64 RETURNING *`,
      [
        d.customer_id||null, d.agent_id||null, d.person_type||'personal', d.insured_name, d.jumin||null,
        d.corp_name||null, d.biz_no||null, d.corp_no||null, d.ceo_name||null, d.phone||null,
        d.prev_company||null, d.prev_premium||0, d.driver_range||null, d.age_limit||null,
        d.driver_name||null, d.driver_birth||null, d.driver_gender||null,
        d.car_code||null, d.car_name||null, d.car_number||null, d.car_year||null, d.car_price||0,
        d.cc||0, d.car_grade||null, d.people||null, d.sports||null,
        d.airbag||'0', d.abs_yn||'0', d.steal_yn||'0', d.transmission||null, d.fuel_type||null, d.outset_date||null,
        d.dambo_d2||null, d.dambo_dm||null, d.dambo_js||null, d.dambo_mu||null, d.dambo_jc||null, d.dambo_em||null,
        d.insurance_start||null, d.insurance_end||null,
        d.career_ins||'B5', d.career_car||'B5', d.prev_3yr||'4', d.halin_grade||'13Z',
        d.traffic_code||'C012', d.traffic_count||0, d.car_count||1, d.muljuk||200,
        d.acci_3yr||0, d.acci_1yr||0, d.acci_score||0,
        JSON.stringify(d.discount_tags||{}), d.map_type||'0', d.map_score||'0', d.mileage||'0',
        d.hd_special||'h01', d.samsung_3yr||null, d.meritz_3yr||'B5',
        d.parts_total||0, JSON.stringify(d.parts_detail||{}),
        JSON.stringify(d.result_data||[]), d.status||'draft', d.memo||null,
        req.params.id
      ]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/quotes/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE quotes SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/quotes/:id/result - save calculation result
router.put('/:id/result', async (req, res) => {
  try {
    const { result_data } = req.body;
    const result = await pool.query(
      `UPDATE quotes SET result_data=$1, status='calculated', updated_at=NOW() WHERE id=$2 RETURNING *`,
      [JSON.stringify(result_data), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/:id/convert - convert quote to contract
router.post('/:id/convert', async (req, res) => {
  try {
    const quote = await pool.query('SELECT * FROM quotes WHERE id = $1', [req.params.id]);
    if (!quote.rows.length) return res.status(404).json({ error: 'Not found' });

    const q = quote.rows[0];
    const bestResult = Array.isArray(q.result_data) && q.result_data.length > 0
      ? q.result_data.reduce((a, b) => (a.off < b.off && a.off > 0) ? a : b)
      : null;

    // create contract from quote
    const contract = await pool.query(
      `INSERT INTO contracts (
        customer_id, agent_id, quote_type, insurance_company, premium,
        coverage_type, driver_range, age_range, insurance_period,
        previous_company, status, start_date, end_date, memo
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        q.customer_id, q.agent_id, 'CM',
        bestResult?.name || null, bestResult?.cm || bestResult?.off || 0,
        q.dambo_d2 === '8' ? 'premium' : 'basic',
        q.driver_range, q.age_limit,
        q.insurance_start && q.insurance_end ? `${q.insurance_start}~${q.insurance_end}` : null,
        q.prev_company, 'contract',
        q.insurance_start ? `${q.insurance_start.substring(0,4)}-${q.insurance_start.substring(4,6)}-${q.insurance_start.substring(6,8)}` : null,
        q.insurance_end ? `${q.insurance_end.substring(0,4)}-${q.insurance_end.substring(4,6)}-${q.insurance_end.substring(6,8)}` : null,
        `quote #${q.id} converted`
      ]
    );

    // update quote status
    await pool.query(
      `UPDATE quotes SET status='contracted', updated_at=NOW() WHERE id=$1`,
      [req.params.id]
    );

    res.json({ quote_id: q.id, contract: contract.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM quotes WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
