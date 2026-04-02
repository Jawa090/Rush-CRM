const db = require('../config/database');

class SegmentService {
  async evaluateSegment(segmentId, orgId) {
    // Get segment rules
    const segmentResult = await db.query(
      'SELECT * FROM marketing_segments WHERE id = $1 AND org_id = $2',
      [segmentId, orgId]
    );

    if (segmentResult.rows.length === 0) {
      throw new Error('Segment not found');
    }

    const segment = segmentResult.rows[0];
    const rules = segment.rules || [];

    if (rules.length === 0) {
      return [];
    }

    // Build SQL query based on rules
    const query = this.buildSegmentQuery(rules, orgId);
    const result = await db.query(query.sql, query.params);

    return result.rows;
  }

  buildSegmentQuery(ruleGroups, orgId) {
    const groupQueries = [];
    const params = [orgId];
    let paramIndex = 2;

    for (const group of ruleGroups) {
      const ruleConditions = [];

      for (const rule of group.rules) {
        const condition = this.buildRuleCondition(rule, params, paramIndex);
        if (condition) {
          ruleConditions.push(condition.sql);
          paramIndex = condition.paramIndex;
        }
      }

      if (ruleConditions.length > 0) {
        const groupLogic = group.logic || 'AND';
        groupQueries.push(`(${ruleConditions.join(` ${groupLogic} `)})`);
      }
    }

    const whereClause = groupQueries.length > 0 
      ? groupQueries.join(' OR ')
      : '1=1';

    const sql = `
      SELECT DISTINCT c.* 
      FROM contacts c
      WHERE c.org_id = $1 AND (${whereClause})
      ORDER BY c.created_at DESC
    `;

    return { sql, params };
  }

  buildRuleCondition(rule, params, paramIndex) {
    const { field, operator, value, type } = rule;

    // Contact field rules
    if (type === 'contact') {
      switch (operator) {
        case 'equals':
          params.push(value);
          return { sql: `c.${field} = $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'not_equals':
          params.push(value);
          return { sql: `c.${field} != $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'contains':
          params.push(`%${value}%`);
          return { sql: `c.${field} ILIKE $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'not_contains':
          params.push(`%${value}%`);
          return { sql: `c.${field} NOT ILIKE $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'starts_with':
          params.push(`${value}%`);
          return { sql: `c.${field} ILIKE $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'ends_with':
          params.push(`%${value}`);
          return { sql: `c.${field} ILIKE $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'is_empty':
          return { sql: `(c.${field} IS NULL OR c.${field} = '')`, paramIndex };
        
        case 'is_not_empty':
          return { sql: `(c.${field} IS NOT NULL AND c.${field} != '')`, paramIndex };
        
        case 'before':
          params.push(value);
          return { sql: `c.${field} < $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'after':
          params.push(value);
          return { sql: `c.${field} > $${paramIndex}`, paramIndex: paramIndex + 1 };
        
        case 'in_last':
          params.push(parseInt(value));
          return { sql: `c.${field} > NOW() - INTERVAL '$${paramIndex} days'`, paramIndex: paramIndex + 1 };
      }
    }

    // Activity-based rules
    if (type === 'activity') {
      switch (field) {
        case 'email_opened':
          return {
            sql: `EXISTS (
              SELECT 1 FROM marketing_campaign_events e
              WHERE e.email = c.email AND e.event_type = 'opened'
            )`,
            paramIndex
          };
        
        case 'email_clicked':
          return {
            sql: `EXISTS (
              SELECT 1 FROM marketing_campaign_events e
              WHERE e.email = c.email AND e.event_type = 'clicked'
            )`,
            paramIndex
          };
        
        case 'form_submitted':
          return {
            sql: `EXISTS (
              SELECT 1 FROM marketing_form_submissions fs
              WHERE fs.contact_id = c.id
            )`,
            paramIndex
          };
      }
    }

    return null;
  }

  async getSegmentCount(segmentId, orgId) {
    const contacts = await this.evaluateSegment(segmentId, orgId);
    return contacts.length;
  }

  async syncSegmentMembers(segmentId, orgId) {
    // Get segment contacts
    const contacts = await this.evaluateSegment(segmentId, orgId);

    // Get associated list
    const segmentResult = await db.query(
      'SELECT list_id FROM marketing_segments WHERE id = $1',
      [segmentId]
    );

    if (segmentResult.rows.length === 0 || !segmentResult.rows[0].list_id) {
      return { synced: 0 };
    }

    const listId = segmentResult.rows[0].list_id;

    // Clear existing members
    await db.query(
      'DELETE FROM marketing_list_members WHERE list_id = $1',
      [listId]
    );

    // Add new members
    let synced = 0;
    for (const contact of contacts) {
      await db.query(
        `INSERT INTO marketing_list_members (list_id, contact_id, added_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (list_id, contact_id) DO NOTHING`,
        [listId, contact.id]
      );
      synced++;
    }

    return { synced };
  }
}

module.exports = new SegmentService();
