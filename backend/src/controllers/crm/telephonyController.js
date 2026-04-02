const db = require('../../config/database');

exports.getProviders = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM telephony_providers WHERE org_id = $1 ORDER BY provider_name',
      [req.user.orgId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const { is_enabled } = req.body;
    const { rows } = await db.query(
      'UPDATE telephony_providers SET is_enabled = $1 WHERE id = $2 AND org_id = $3 RETURNING *',
      [is_enabled, req.params.id, req.user.orgId]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
