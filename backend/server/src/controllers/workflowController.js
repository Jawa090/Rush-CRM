const db = require('../config/database');
const { fireWorkflows } = require('../services/workflowEngine');

const getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM public.workflows WHERE org_id = $1 ORDER BY created_at DESC',
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM public.workflows WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const actionsResult = await db.query(
      'SELECT * FROM public.workflow_actions WHERE workflow_id = $1 ORDER BY sort_order',
      [id]
    );

    res.json({
      ...result.rows[0],
      actions: actionsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, trigger_type, trigger_config, actions, is_active } = req.body;

    const result = await db.query(
      `INSERT INTO public.workflows (org_id, created_by, name, description, trigger_type, trigger_config, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, description, trigger_type, JSON.stringify(trigger_config || {}), is_active || false]
    );

    const workflowId = result.rows[0].id;

    if (actions && actions.length > 0) {
      for (let i = 0; i < actions.length; i++) {
        await db.query(
          `INSERT INTO public.workflow_actions (workflow_id, org_id, action_type, action_config, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [workflowId, req.user.orgId, actions[i].type, JSON.stringify(actions[i].config || {}), i]
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, trigger_type, trigger_config, actions, is_active } = req.body;

    const result = await db.query(
      `UPDATE public.workflows 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           trigger_type = COALESCE($3, trigger_type),
           trigger_config = COALESCE($4, trigger_config),
           is_active = COALESCE($5, is_active),
           updated_at = now()
       WHERE id = $6 AND org_id = $7
       RETURNING *`,
      [name, description, trigger_type, trigger_config ? JSON.stringify(trigger_config) : null, is_active, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    if (actions) {
      await db.query('DELETE FROM public.workflow_actions WHERE workflow_id = $1', [id]);
      
      for (let i = 0; i < actions.length; i++) {
        await db.query(
          `INSERT INTO public.workflow_actions (workflow_id, org_id, action_type, action_config, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, req.user.orgId, actions[i].type, JSON.stringify(actions[i].config || {}), i]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const trigger = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { entityType, entityId } = req.body;

    // Get the workflow to verify it exists and belongs to this org
    const { rows } = await db.query(
      'SELECT * FROM public.workflows WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Workflow not found' });

    // Build a synthetic entity for manual test triggers
    const entity = { id: entityId || null, title: 'Test Entity', name: 'Test Entity', user_id: req.user.id };

    // Create execution record
    const { rows: [execution] } = await db.query(
      `INSERT INTO public.workflow_executions
         (workflow_id, entity_type, entity_id, triggered_by, status)
       VALUES ($1, $2, $3, $4, 'running')
       RETURNING *`,
      [id, entityType || 'manual', entity.id, req.user.id]
    );

    // Run async via the real engine
    const { runExecution } = require('../services/workflowEngine');
    runExecution && runExecution(execution.id, id, req.user.orgId, entity).catch(err =>
      console.error(`Manual trigger execution ${execution.id} failed:`, err)
    );

    res.json({ message: 'Workflow triggered successfully', execution });
  } catch (err) {
    next(err);
  }
};

// Async function to process workflow execution
const processWorkflowExecution = async (executionId, workflowId, orgId) => {
  try {
    // Get workflow actions
    const actionsResult = await db.query(
      'SELECT * FROM public.workflow_actions WHERE workflow_id = $1 ORDER BY sort_order',
      [workflowId]
    );

    const actions = actionsResult.rows;
    let allSuccessful = true;
    let errorMessage = null;

    // Execute each action
    for (const action of actions) {
      try {
        // Create execution step record
        await db.query(
          `INSERT INTO public.workflow_execution_steps (execution_id, action_id, status, started_at)
           VALUES ($1, $2, 'running', now())`,
          [executionId, action.id]
        );

        // Simulate action execution (in real implementation, this would call actual services)
        await simulateActionExecution(action);

        // Mark step as completed
        await db.query(
          `UPDATE public.workflow_execution_steps 
           SET status = 'completed', completed_at = now()
           WHERE execution_id = $1 AND action_id = $2`,
          [executionId, action.id]
        );

      } catch (actionError) {
        allSuccessful = false;
        errorMessage = `Failed at action "${action.action_type}": ${actionError.message}`;
        
        // Mark step as failed
        await db.query(
          `UPDATE public.workflow_execution_steps 
           SET status = 'failed', completed_at = now(), error_message = $3
           WHERE execution_id = $1 AND action_id = $2`,
          [executionId, action.id, actionError.message]
        );
        break;
      }
    }

    // Update execution status
    await db.query(
      `UPDATE public.workflow_executions 
       SET status = $2, completed_at = now(), error_message = $3
       WHERE id = $1`,
      [executionId, allSuccessful ? 'completed' : 'failed', errorMessage]
    );

  } catch (error) {
    console.error('Error processing workflow execution:', error);
    // Mark execution as failed
    await db.query(
      `UPDATE public.workflow_executions 
       SET status = 'failed', completed_at = now(), error_message = $2
       WHERE id = $1`,
      [executionId, error.message]
    );
  }
};

// Simulate action execution (replace with real implementations)
const simulateActionExecution = async (action) => {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  switch (action.action_type) {
    case 'send_email':
      console.log(`📧 Simulated: Sending email with config:`, action.action_config);
      break;
    case 'create_task':
      console.log(`📝 Simulated: Creating task with config:`, action.action_config);
      break;
    case 'assign_owner':
      console.log(`👤 Simulated: Assigning owner with config:`, action.action_config);
      break;
    case 'change_stage':
      console.log(`🔄 Simulated: Changing stage with config:`, action.action_config);
      break;
    case 'send_webhook':
      console.log(`🔗 Simulated: Sending webhook with config:`, action.action_config);
      break;
    case 'update_field':
      console.log(`✏️ Simulated: Updating field with config:`, action.action_config);
      break;
    case 'add_tag':
      console.log(`🏷️ Simulated: Adding tag with config:`, action.action_config);
      break;
    case 'ai_classify':
      console.log(`🤖 Simulated: AI classification with config:`, action.action_config);
      break;
    default:
      console.log(`❓ Simulated: Unknown action type "${action.action_type}"`);
  }
  
  // Randomly fail some actions for testing (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Simulated random failure for testing');
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM public.workflow_actions WHERE workflow_id = $1', [id]);
    
    const result = await db.query(
      'DELETE FROM public.workflows WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ message: 'Workflow deleted' });
  } catch (err) {
    next(err);
  }
};

const createAction = async (req, res, next) => {
  try {
    const { workflow_id, action_type, action_config, condition_config, sort_order } = req.body;
    
    const result = await db.query(
      `INSERT INTO public.workflow_actions (workflow_id, org_id, action_type, action_config, condition_config, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [workflow_id, req.user.orgId, action_type, JSON.stringify(action_config || {}), condition_config ? JSON.stringify(condition_config) : null, sort_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action_type, action_config, condition_config, sort_order } = req.body;
    
    const result = await db.query(
      `UPDATE public.workflow_actions 
       SET action_type = COALESCE($1, action_type),
           action_config = COALESCE($2, action_config),
           condition_config = COALESCE($3, condition_config),
           sort_order = COALESCE($4, sort_order),
           updated_at = now()
       WHERE id = $5
       RETURNING *`,
      [action_type, action_config ? JSON.stringify(action_config) : null, condition_config ? JSON.stringify(condition_config) : null, sort_order, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow action not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM public.workflow_actions WHERE id = $1', [id]);
    
    res.json({ message: 'Workflow action deleted' });
  } catch (err) {
    next(err);
  }
};

const getWorkflowExecutions = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT we.*, 
              (SELECT json_agg(
                json_build_object(
                  'id', wes.id,
                  'action_id', wes.action_id,
                  'status', wes.status,
                  'started_at', wes.started_at,
                  'completed_at', wes.completed_at,
                  'error_message', wes.error_message,
                  'action_type', wa.action_type
                )
                ORDER BY wa.sort_order
              ) FROM workflow_execution_steps wes
              JOIN workflow_actions wa ON wes.action_id = wa.id
              WHERE wes.execution_id = we.id
              ) as steps
       FROM public.workflow_executions we
       WHERE workflow_id = $1 
       ORDER BY started_at DESC 
       LIMIT 50`,
      [id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  trigger,
  remove,
  createAction,
  updateAction,
  deleteAction,
  getWorkflowExecutions,
};
