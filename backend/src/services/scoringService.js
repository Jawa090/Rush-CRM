const db = require('../config/database');

class ScoringService {
  async calculateContactScore(contactId, orgId) {
    // Get all active scoring rules
    const rulesResult = await db.query(
      'SELECT * FROM marketing_scoring_rules WHERE org_id = $1 AND is_active = true',
      [orgId]
    );

    const rules = rulesResult.rows;
    let totalScore = 0;
    const appliedRules = [];

    // Get contact data
    const contactResult = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND org_id = $2',
      [contactId, orgId]
    );

    if (contactResult.rows.length === 0) {
      throw new Error('Contact not found');
    }

    const contact = contactResult.rows[0];

    // Evaluate each rule
    for (const rule of rules) {
      const points = await this.evaluateRule(rule, contact);
      if (points > 0) {
        totalScore += points;
        appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          points,
        });
      }
    }

    // Cap score at 100
    totalScore = Math.min(totalScore, 100);

    // Update contact score
    const previousScore = contact.score || 0;
    await db.query(
      'UPDATE contacts SET score = $1 WHERE id = $2',
      [totalScore, contactId]
    );

    // Log scoring history
    for (const applied of appliedRules) {
      await db.query(
        `INSERT INTO marketing_scoring_history 
         (contact_id, rule_id, points_change, previous_score, new_score, reason, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [contactId, applied.ruleId, applied.points, previousScore, totalScore, applied.ruleName]
      );
    }

    return {
      contactId,
      previousScore,
      newScore: totalScore,
      appliedRules,
    };
  }

  async evaluateRule(rule, contact) {
    const { rule_type, condition, points } = rule;

    try {
      switch (rule_type) {
        case 'property':
          return this.evaluatePropertyRule(condition, contact) ? points : 0;
        
        case 'activity':
          return await this.evaluateActivityRule(condition, contact) ? points : 0;
        
        case 'engagement':
          return await this.evaluateEngagementRule(condition, contact) ? points : 0;
        
        default:
          return 0;
      }
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return 0;
    }
  }

  evaluatePropertyRule(condition, contact) {
    const { field, operator, value } = condition;
    const contactValue = contact[field];

    switch (operator) {
      case 'equals':
        return contactValue === value;
      case 'not_equals':
        return contactValue !== value;
      case 'contains':
        return contactValue && contactValue.toLowerCase().includes(value.toLowerCase());
      case 'is_empty':
        return !contactValue || contactValue === '';
      case 'is_not_empty':
        return contactValue && contactValue !== '';
      case 'greater_than':
        return parseFloat(contactValue) > parseFloat(value);
      case 'less_than':
        return parseFloat(contactValue) < parseFloat(value);
      default:
        return false;
    }
  }

  async evaluateActivityRule(condition, contact) {
    const { activity_type, timeframe } = condition;

    let query = '';
    let params = [contact.email];

    switch (activity_type) {
      case 'email_opened':
        query = `SELECT COUNT(*) as count FROM marketing_campaign_events 
                 WHERE email = $1 AND event_type = 'opened'`;
        break;
      
      case 'email_clicked':
        query = `SELECT COUNT(*) as count FROM marketing_campaign_events 
                 WHERE email = $1 AND event_type = 'clicked'`;
        break;
      
      case 'form_submitted':
        query = `SELECT COUNT(*) as count FROM marketing_form_submissions 
                 WHERE contact_id = $1`;
        params = [contact.id];
        break;
      
      default:
        return false;
    }

    // Add timeframe filter
    if (timeframe && timeframe > 0) {
      query += ` AND created_at > NOW() - INTERVAL '${timeframe} days'`;
    }

    const result = await db.query(query, params);
    return result.rows[0].count > 0;
  }

  async evaluateEngagementRule(condition, contact) {
    const { metric, threshold } = condition;

    let query = '';
    let params = [contact.email];

    switch (metric) {
      case 'open_rate':
        query = `
          SELECT 
            COUNT(CASE WHEN event_type = 'opened' THEN 1 END)::float / 
            NULLIF(COUNT(CASE WHEN event_type = 'sent' THEN 1 END), 0) * 100 as rate
          FROM marketing_campaign_events 
          WHERE email = $1
        `;
        break;
      
      case 'click_rate':
        query = `
          SELECT 
            COUNT(CASE WHEN event_type = 'clicked' THEN 1 END)::float / 
            NULLIF(COUNT(CASE WHEN event_type = 'sent' THEN 1 END), 0) * 100 as rate
          FROM marketing_campaign_events 
          WHERE email = $1
        `;
        break;
      
      default:
        return false;
    }

    const result = await db.query(query, params);
    const rate = result.rows[0]?.rate || 0;
    return rate >= threshold;
  }

  async recalculateAllScores(orgId) {
    // Get all contacts for org
    const contactsResult = await db.query(
      'SELECT id FROM contacts WHERE org_id = $1',
      [orgId]
    );

    const results = [];
    for (const contact of contactsResult.rows) {
      try {
        const result = await this.calculateContactScore(contact.id, orgId);
        results.push(result);
      } catch (error) {
        console.error(`Error calculating score for contact ${contact.id}:`, error);
      }
    }

    return {
      total: contactsResult.rows.length,
      updated: results.length,
      results,
    };
  }

  async getTopScoredContacts(orgId, limit = 10) {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, company, score, score_updated_at
       FROM contacts 
       WHERE org_id = $1 AND score > 0
       ORDER BY score DESC, score_updated_at DESC
       LIMIT $2`,
      [orgId, limit]
    );

    return result.rows;
  }

  async getScoringHistory(contactId, limit = 20) {
    const result = await db.query(
      `SELECT sh.*, sr.name as rule_name
       FROM marketing_scoring_history sh
       LEFT JOIN marketing_scoring_rules sr ON sh.rule_id = sr.id
       WHERE sh.contact_id = $1
       ORDER BY sh.created_at DESC
       LIMIT $2`,
      [contactId, limit]
    );

    return result.rows;
  }
}

module.exports = new ScoringService();
