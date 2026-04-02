const db = require('../config/database');
const emailService = require('./emailService');

class ABTestService {
  async createTest(testData, orgId) {
    const {
      name,
      description,
      test_type,
      winner_criteria,
      sample_size_percentage,
      test_duration_hours,
      variants,
    } = testData;

    // Create test
    const testResult = await db.query(
      `INSERT INTO marketing_ab_tests 
       (org_id, name, description, test_type, winner_criteria, sample_size_percentage, test_duration_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [orgId, name, description, test_type, winner_criteria, sample_size_percentage, test_duration_hours]
    );

    const test = testResult.rows[0];

    // Create variants
    const createdVariants = [];
    for (const variant of variants) {
      const variantResult = await db.query(
        `INSERT INTO marketing_ab_test_variants 
         (test_id, variant_name, subject_line, content, from_name, from_email)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [test.id, variant.name, variant.subject_line, variant.content, variant.from_name, variant.from_email]
      );
      createdVariants.push(variantResult.rows[0]);
    }

    return {
      test,
      variants: createdVariants,
    };
  }

  async startTest(testId, listId, orgId) {
    // Get test and variants
    const testResult = await db.query(
      'SELECT * FROM marketing_ab_tests WHERE id = $1 AND org_id = $2',
      [testId, orgId]
    );

    if (testResult.rows.length === 0) {
      throw new Error('Test not found');
    }

    const test = testResult.rows[0];

    const variantsResult = await db.query(
      'SELECT * FROM marketing_ab_test_variants WHERE test_id = $1',
      [testId]
    );

    const variants = variantsResult.rows;

    if (variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    // Get contacts from list
    const contactsResult = await db.query(
      `SELECT c.* FROM contacts c
       JOIN marketing_list_members lm ON c.id = lm.contact_id
       WHERE lm.list_id = $1 AND c.org_id = $2`,
      [listId, orgId]
    );

    const allContacts = contactsResult.rows;
    const sampleSize = Math.floor(allContacts.length * (test.sample_size_percentage / 100));
    const testContacts = allContacts.slice(0, sampleSize);

    // Distribute contacts evenly across variants
    const contactsPerVariant = Math.floor(testContacts.length / variants.length);
    
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const variantContacts = testContacts.slice(
        i * contactsPerVariant,
        (i + 1) * contactsPerVariant
      );

      // Send emails for this variant
      await this.sendVariantEmails(test, variant, variantContacts);
    }

    // Update test status
    await db.query(
      'UPDATE marketing_ab_tests SET status = $1, started_at = NOW() WHERE id = $2',
      ['running', testId]
    );

    return {
      testId,
      variantsSent: variants.length,
      totalSent: testContacts.length,
    };
  }

  async sendVariantEmails(test, variant, contacts) {
    for (const contact of contacts) {
      try {
        // Send email
        await emailService.sendEmail({
          to: contact.email,
          subject: emailService.replaceTokens(variant.subject_line, contact),
          html: emailService.replaceTokens(variant.content, contact),
          from: variant.from_email,
        });

        // Log result
        await db.query(
          `INSERT INTO marketing_ab_test_results 
           (test_id, variant_id, contact_id, email, event_type)
           VALUES ($1, $2, $3, $4, 'sent')`,
          [test.id, variant.id, contact.id, contact.email]
        );
      } catch (error) {
        console.error(`Error sending to ${contact.email}:`, error);
      }
    }
  }

  async trackEvent(testId, variantId, email, eventType) {
    await db.query(
      `INSERT INTO marketing_ab_test_results 
       (test_id, variant_id, email, event_type)
       VALUES ($1, $2, $3, $4)`,
      [testId, variantId, email, eventType]
    );
  }

  async determineWinner(testId, orgId) {
    // Get test
    const testResult = await db.query(
      'SELECT * FROM marketing_ab_tests WHERE id = $1 AND org_id = $2',
      [testId, orgId]
    );

    if (testResult.rows.length === 0) {
      throw new Error('Test not found');
    }

    const test = testResult.rows[0];

    // Get variants with stats
    const variantsResult = await db.query(
      'SELECT * FROM marketing_ab_test_variants WHERE test_id = $1 ORDER BY variant_name',
      [testId]
    );

    const variants = variantsResult.rows;

    // Determine winner based on criteria
    let winner;
    switch (test.winner_criteria) {
      case 'open_rate':
        winner = variants.reduce((max, v) => v.open_rate > max.open_rate ? v : max);
        break;
      case 'click_rate':
        winner = variants.reduce((max, v) => v.click_rate > max.click_rate ? v : max);
        break;
      case 'conversion_rate':
        winner = variants.reduce((max, v) => v.conversion_rate > max.conversion_rate ? v : max);
        break;
      default:
        winner = variants[0];
    }

    // Update test with winner
    await db.query(
      `UPDATE marketing_ab_tests 
       SET winner_variant_id = $1, status = 'completed', completed_at = NOW()
       WHERE id = $2`,
      [winner.id, testId]
    );

    // Mark winner variant
    await db.query(
      'UPDATE marketing_ab_test_variants SET is_winner = true WHERE id = $1',
      [winner.id]
    );

    return {
      test,
      winner,
      variants,
    };
  }

  async getTestResults(testId, orgId) {
    const testResult = await db.query(
      'SELECT * FROM marketing_ab_tests WHERE id = $1 AND org_id = $2',
      [testId, orgId]
    );

    if (testResult.rows.length === 0) {
      throw new Error('Test not found');
    }

    const variantsResult = await db.query(
      'SELECT * FROM marketing_ab_test_variants WHERE test_id = $1 ORDER BY variant_name',
      [testId]
    );

    return {
      test: testResult.rows[0],
      variants: variantsResult.rows,
    };
  }

  async sendWinnerToRemaining(testId, listId, orgId) {
    // Get winner variant
    const testResult = await db.query(
      'SELECT * FROM marketing_ab_tests WHERE id = $1 AND org_id = $2',
      [testId, orgId]
    );

    const test = testResult.rows[0];

    if (!test.winner_variant_id) {
      throw new Error('No winner determined yet');
    }

    const winnerResult = await db.query(
      'SELECT * FROM marketing_ab_test_variants WHERE id = $1',
      [test.winner_variant_id]
    );

    const winner = winnerResult.rows[0];

    // Get contacts who didn't receive test
    const sentEmailsResult = await db.query(
      'SELECT DISTINCT email FROM marketing_ab_test_results WHERE test_id = $1',
      [testId]
    );

    const sentEmails = sentEmailsResult.rows.map(r => r.email);

    const remainingResult = await db.query(
      `SELECT c.* FROM contacts c
       JOIN marketing_list_members lm ON c.id = lm.contact_id
       WHERE lm.list_id = $1 AND c.org_id = $2 AND c.email NOT IN (${sentEmails.map((_, i) => `$${i + 3}`).join(',')})`,
      [listId, orgId, ...sentEmails]
    );

    const remaining = remainingResult.rows;

    // Send winner to remaining contacts
    for (const contact of remaining) {
      try {
        await emailService.sendEmail({
          to: contact.email,
          subject: emailService.replaceTokens(winner.subject_line, contact),
          html: emailService.replaceTokens(winner.content, contact),
          from: winner.from_email,
        });
      } catch (error) {
        console.error(`Error sending to ${contact.email}:`, error);
      }
    }

    return {
      sent: remaining.length,
    };
  }
}

module.exports = new ABTestService();
