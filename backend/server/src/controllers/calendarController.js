const db = require('../config/database');

const getEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM public.calendar_events WHERE org_id = $1';
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND end_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND start_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY start_time ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM public.calendar_events WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, location, color, allDay, recurrence } = req.body;

    const result = await db.query(
      `INSERT INTO public.calendar_events (org_id, created_by, title, description, start_time, end_time, location, color, is_all_day, recurrence_rule)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.orgId, req.user.id, title, description, startTime, endTime, location, color, allDay || false, recurrence]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, location, color, allDay, recurrence } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (startTime !== undefined) { fields.push(`start_time = $${paramIndex++}`); values.push(startTime); }
    if (endTime !== undefined) { fields.push(`end_time = $${paramIndex++}`); values.push(endTime); }
    if (location !== undefined) { fields.push(`location = $${paramIndex++}`); values.push(location); }
    if (color !== undefined) { fields.push(`color = $${paramIndex++}`); values.push(color); }
    if (allDay !== undefined) { fields.push(`is_all_day = $${paramIndex++}`); values.push(allDay); }
    if (recurrence !== undefined) { fields.push(`recurrence = $${paramIndex++}`); values.push(recurrence); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.calendar_events SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
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
      'DELETE FROM public.calendar_events WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEvents,
  getById,
  create,
  update,
  remove,
};
