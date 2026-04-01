const db = require('../config/database');

/**
 * Fire all active workflows matching a trigger type for an org.
 * Call this from any controller after a CRM event occurs.
 *
 * @param {string} orgId
 * @param {string} triggerType  e.g. 'lead_created', 'deal_stage_changed'
 * @param {object} entity       the full DB row that caused the event
 * @param {string} triggeredBy  userId who caused the event (can be null for system)
 */
const fireWorkflows = async (orgId, triggerType, entity, triggeredBy = null) => {
  try {
    const { rows: workflows } = await db.query(
      `SELECT * FROM public.workflows
       WHERE org_id = $1 AND trigger_type = $2 AND is_active = true`,
      [orgId, triggerType]
    );

    for (const workflow of workflows) {
      // Create execution record
      const { rows: [execution] } = await db.query(
        `INSERT INTO public.workflow_executions
           (workflow_id, entity_type, entity_id, triggered_by, status)
         VALUES ($1, $2, $3, $4, 'running')
         RETURNING *`,
        [workflow.id, triggerType.split('_')[0], entity.id || null, triggeredBy]
      );

      // Run async — don't block the HTTP response
      runExecution(execution.id, workflow.id, orgId, entity).catch(err =>
        console.error(`Workflow execution ${execution.id} failed:`, err)
      );
    }
  } catch (err) {
    // Never crash the caller
    console.error('fireWorkflows error:', err);
  }
};

const runExecution = async (executionId, workflowId, orgId, entity) => {
  const { rows: actions } = await db.query(
    `SELECT * FROM public.workflow_actions
     WHERE workflow_id = $1 ORDER BY sort_order ASC`,
    [workflowId]
  );

  let success = true;
  let errorMsg = null;

  for (const action of actions) {
    // Record step start
    await db.query(
      `INSERT INTO public.workflow_execution_steps
         (execution_id, action_id, status, started_at)
       VALUES ($1, $2, 'running', now())`,
      [executionId, action.id]
    ).catch(() => {});

    try {
      await executeAction(action, entity, orgId);

      await db.query(
        `UPDATE public.workflow_execution_steps
         SET status = 'completed', completed_at = now()
         WHERE execution_id = $1 AND action_id = $2`,
        [executionId, action.id]
      ).catch(() => {});
    } catch (err) {
      success = false;
      errorMsg = `Action "${action.action_type}" failed: ${err.message}`;

      await db.query(
        `UPDATE public.workflow_execution_steps
         SET status = 'failed', completed_at = now(), error_message = $3
         WHERE execution_id = $1 AND action_id = $2`,
        [executionId, action.id, err.message]
      ).catch(() => {});
      break;
    }
  }

  await db.query(
    `UPDATE public.workflow_executions
     SET status = $2, completed_at = now(), error_message = $3
     WHERE id = $1`,
    [executionId, success ? 'completed' : 'failed', errorMsg]
  ).catch(() => {});
};

const executeAction = async (action, entity, orgId) => {
  const config = action.action_config || {};

  switch (action.action_type) {

    case 'create_task': {
      const title = config.title
        ? interpolate(config.title, entity)
        : `Follow up: ${entity.title || entity.name || 'Record'}`;

      await db.query(
        `INSERT INTO public.tasks
           (org_id, title, description, priority, status, due_date, created_by)
         VALUES ($1, $2, $3, $4, 'todo', $5, $6)`,
        [
          orgId,
          title,
          config.description ? interpolate(config.description, entity) : null,
          config.priority || 'medium',
          config.due_days
            ? new Date(Date.now() + config.due_days * 86400000)
            : null,
          entity.user_id || null,
        ]
      );
      console.log(`[Workflow] create_task: "${title}"`);
      break;
    }

    case 'assign_owner': {
      if (!config.user_id) break;
      const table = guessTable(entity);
      if (table) {
        await db.query(
          `UPDATE public.${table} SET assigned_to = $1, updated_at = now() WHERE id = $2`,
          [config.user_id, entity.id]
        );
        console.log(`[Workflow] assign_owner: ${table} ${entity.id} → ${config.user_id}`);
      }
      break;
    }

    case 'change_stage': {
      if (!config.stage) break;
      const table = guessTable(entity);
      if (table) {
        await db.query(
          `UPDATE public.${table} SET stage = $1, updated_at = now() WHERE id = $2`,
          [config.stage, entity.id]
        );
        console.log(`[Workflow] change_stage: ${table} ${entity.id} → ${config.stage}`);
      }
      break;
    }

    case 'update_field': {
      if (!config.field || config.value === undefined) break;
      const table = guessTable(entity);
      if (table) {
        // Whitelist safe field names (alphanumeric + underscore only)
        const safeField = config.field.replace(/[^a-z0-9_]/gi, '');
        await db.query(
          `UPDATE public.${table} SET ${safeField} = $1, updated_at = now() WHERE id = $2`,
          [config.value, entity.id]
        );
        console.log(`[Workflow] update_field: ${table}.${safeField} = ${config.value}`);
      }
      break;
    }

    case 'add_tag': {
      if (!config.tag) break;
      const table = guessTable(entity);
      if (table) {
        await db.query(
          `UPDATE public.${table}
           SET tags = array_append(COALESCE(tags, '{}'), $1), updated_at = now()
           WHERE id = $2 AND NOT ($1 = ANY(COALESCE(tags, '{}')))`,
          [config.tag, entity.id]
        );
        console.log(`[Workflow] add_tag: "${config.tag}" to ${table} ${entity.id}`);
      }
      break;
    }

    case 'send_webhook': {
      if (!config.url) break;
      try {
        const https = require('https');
        const http = require('http');
        const url = new URL(config.url);
        const payload = JSON.stringify({ entity, trigger: action.action_type, timestamp: new Date() });
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        };
        const lib = url.protocol === 'https:' ? https : http;
        await new Promise((resolve, reject) => {
          const req = lib.request(options, resolve);
          req.on('error', reject);
          req.write(payload);
          req.end();
        });
        console.log(`[Workflow] send_webhook: POST ${config.url}`);
      } catch (e) {
        console.warn(`[Workflow] send_webhook failed: ${e.message}`);
      }
      break;
    }

    case 'send_email':
      // Placeholder — integrate with your email service here
      console.log(`[Workflow] send_email: to=${config.to || entity.email}, subject=${config.subject}`);
      break;

    case 'ai_classify':
      console.log(`[Workflow] ai_classify: entity ${entity.id}`);
      break;

    default:
      console.log(`[Workflow] unknown action: ${action.action_type}`);
  }
};

// Simple {{field}} interpolation
const interpolate = (template, entity) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => entity[key] ?? '');

// Guess the table from entity shape
const guessTable = (entity) => {
  if (entity.stage !== undefined && entity.probability !== undefined) return 'deals';
  if (entity.stage !== undefined) return 'leads';
  if (entity.first_name !== undefined) return 'contacts';
  return null;
};

module.exports = { fireWorkflows, runExecution };
