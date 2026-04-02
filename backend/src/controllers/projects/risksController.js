const db = require('../../config/database');

const getByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT pr.*, u.full_name as owner_name, c.full_name as created_by_name
       FROM project_risks pr
       LEFT JOIN users u ON pr.owner_id = u.id
       LEFT JOIN users c ON pr.created_by = c.id
       WHERE pr.project_id = $1 AND pr.org_id = $2 
       ORDER BY 
         CASE pr.severity 
           WHEN 'high' THEN 1 
           WHEN 'medium' THEN 2 
           WHEN 'low' THEN 3 
         END,
         pr.created_at DESC`,
      [projectId, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, severity, probability, impact, mitigation_plan, owner_id, category } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Risk title is required' });
    }

    const result = await db.query(
      `INSERT INTO project_risks (org_id, project_id, title, description, severity, probability, impact, mitigation_plan, owner_id, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        req.user.orgId, 
        projectId, 
        title.trim(), 
        description || null, 
        severity || 'medium', 
        probability || 'medium', 
        impact || 'medium', 
        mitigation_plan || null, 
        owner_id || null, 
        category || 'risk',
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, severity, probability, impact, status, mitigation_plan, owner_id, category } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (severity !== undefined) { fields.push(`severity = $${paramIndex++}`); values.push(severity); }
    if (probability !== undefined) { fields.push(`probability = $${paramIndex++}`); values.push(probability); }
    if (impact !== undefined) { fields.push(`impact = $${paramIndex++}`); values.push(impact); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (mitigation_plan !== undefined) { fields.push(`mitigation_plan = $${paramIndex++}`); values.push(mitigation_plan); }
    if (owner_id !== undefined) { fields.push(`owner_id = $${paramIndex++}`); values.push(owner_id); }
    if (category !== undefined) { fields.push(`category = $${paramIndex++}`); values.push(category); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE project_risks SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM project_risks WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.json({ message: 'Risk deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByProject,
  create,
  update,
  remove,
};
