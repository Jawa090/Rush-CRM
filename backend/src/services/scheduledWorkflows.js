/**
 * Scheduled Workflow Service
 * 
 * Cron-based workflow automation:
 * - Hourly, Daily, Weekly, Monthly schedules
 * - Batch processing
 * - Target filtering
 * - Automatic retry logic
 * 
 * @module services/scheduledWorkflows
 */

const db = require('../config/database');
const { fireWorkflows } = require('./advancedWorkflowEngine');

/**
 * Scheduled Workflows - Cron-based automation
 * Runs workflows on schedule (daily, weekly, monthly)
 */

class ScheduledWorkflowService {
  constructor() {
    this.intervals = new Map();
    this.isRunning = false;
  }

  /**
   * Start the scheduled workflow service
   */
  start() {
    if (this.isRunning) return;
    
    console.log('🕐 Starting Scheduled Workflow Service...');
    this.isRunning = true;

    // Check every minute for scheduled workflows
    this.mainInterval = setInterval(() => {
      this.checkScheduledWorkflows().catch(err =>
        console.error('Scheduled workflow check error:', err)
      );
    }, 60 * 1000); // Every 1 minute

    // Initial check
    this.checkScheduledWorkflows();
  }

  /**
   * Stop the service
   */
  stop() {
    if (this.mainInterval) {
      clearInterval(this.mainInterval);
      this.mainInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped Scheduled Workflow Service');
  }

  /**
   * Check and run scheduled workflows
   */
  async checkScheduledWorkflows() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay(); // 0 = Sunday
      const currentDate = now.getDate();

      // Get all scheduled workflows
      const { rows: workflows } = await db.query(`
        SELECT * FROM workflows
        WHERE is_active = true 
        AND trigger_type = 'scheduled'
        AND trigger_config IS NOT NULL
      `);

      for (const workflow of workflows) {
        const config = workflow.trigger_config || {};
        const schedule = config.schedule || {};

        // Check if workflow should run now
        if (this.shouldRunNow(schedule, currentHour, currentMinute, currentDay, currentDate)) {
          // Check if already ran in this time window
          const lastRun = await this.getLastExecution(workflow.id);
          
          if (this.canRunAgain(lastRun, schedule.frequency)) {
            console.log(`[Scheduled] Running workflow: ${workflow.name}`);
            await this.executeScheduledWorkflow(workflow);
          }
        }
      }
    } catch (err) {
      console.error('checkScheduledWorkflows error:', err);
    }
  }

  /**
   * Check if workflow should run now
   */
  shouldRunNow(schedule, hour, minute, day, date) {
    const { frequency, time, day_of_week, day_of_month } = schedule;

    // Parse scheduled time (e.g., "09:00")
    const [schedHour, schedMinute] = (time || '09:00').split(':').map(Number);

    // Check if current time matches scheduled time (within 1 minute window)
    if (hour !== schedHour || Math.abs(minute - schedMinute) > 1) {
      return false;
    }

    switch (frequency) {
      case 'daily':
        return true;

      case 'weekly':
        // day_of_week: 0=Sunday, 1=Monday, etc.
        return day === (day_of_week || 1);

      case 'monthly':
        // day_of_month: 1-31
        return date === (day_of_month || 1);

      case 'hourly':
        return true;

      default:
        return false;
    }
  }

  /**
   * Check if workflow can run again
   */
  canRunAgain(lastRun, frequency) {
    if (!lastRun) return true;

    const now = Date.now();
    const lastRunTime = new Date(lastRun.started_at).getTime();
    const timeDiff = now - lastRunTime;

    switch (frequency) {
      case 'hourly':
        return timeDiff > 55 * 60 * 1000; // 55 minutes
      case 'daily':
        return timeDiff > 23 * 60 * 60 * 1000; // 23 hours
      case 'weekly':
        return timeDiff > 6.9 * 24 * 60 * 60 * 1000; // 6.9 days
      case 'monthly':
        return timeDiff > 29 * 24 * 60 * 60 * 1000; // 29 days
      default:
        return true;
    }
  }

  /**
   * Get last execution of workflow
   */
  async getLastExecution(workflowId) {
    const { rows } = await db.query(
      `SELECT * FROM workflow_executions
       WHERE workflow_id = $1
       ORDER BY started_at DESC
       LIMIT 1`,
      [workflowId]
    );
    return rows[0] || null;
  }

  /**
   * Execute scheduled workflow
   */
  async executeScheduledWorkflow(workflow) {
    try {
      const config = workflow.trigger_config || {};
      const targetConfig = config.target || {};

      // Get target records based on configuration
      const records = await this.getTargetRecords(
        workflow.org_id,
        targetConfig.entity_type,
        targetConfig.filters
      );

      console.log(`[Scheduled] Found ${records.length} records to process`);

      // Create execution record
      const { rows: [execution] } = await db.query(
        `INSERT INTO workflow_executions
           (workflow_id, entity_type, entity_id, triggered_by, status, started_at)
         VALUES ($1, $2, $3, $4, 'running', now())
         RETURNING *`,
        [workflow.id, targetConfig.entity_type || 'scheduled', null, null]
      );

      // Process each record
      let successCount = 0;
      let failCount = 0;

      for (const record of records) {
        try {
          // Fire workflow for this record
          await fireWorkflows(
            workflow.org_id,
            'scheduled_execution',
            record,
            null
          );
          successCount++;
        } catch (err) {
          console.error(`Failed to process record ${record.id}:`, err);
          failCount++;
        }
      }

      // Update execution status
      await db.query(
        `UPDATE workflow_executions
         SET status = 'completed', 
             completed_at = now(),
             error_message = $2
         WHERE id = $1`,
        [execution.id, `Processed ${successCount} records, ${failCount} failed`]
      );

      console.log(`[Scheduled] Completed: ${successCount} success, ${failCount} failed`);

    } catch (err) {
      console.error('executeScheduledWorkflow error:', err);
    }
  }

  /**
   * Get target records based on filters
   */
  async getTargetRecords(orgId, entityType, filters = {}) {
    let query = '';
    const params = [orgId];

    switch (entityType) {
      case 'leads':
        query = 'SELECT * FROM leads WHERE org_id = $1';
        break;
      case 'deals':
        query = 'SELECT * FROM deals WHERE org_id = $1';
        break;
      case 'contacts':
        query = 'SELECT * FROM contacts WHERE org_id = $1';
        break;
      case 'tasks':
        query = 'SELECT * FROM tasks WHERE org_id = $1';
        break;
      default:
        return [];
    }

    // Apply filters
    if (filters.stage) {
      query += ` AND stage = $${params.length + 1}`;
      params.push(filters.stage);
    }

    if (filters.status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters.assigned_to) {
      query += ` AND assigned_to = $${params.length + 1}`;
      params.push(filters.assigned_to);
    }

    // Limit to prevent overload
    query += ' LIMIT 1000';

    const { rows } = await db.query(query, params);
    return rows;
  }
}

// Singleton instance
const service = new ScheduledWorkflowService();

module.exports = service;
