# 🧪 Automation System - Real Testing Guide

Complete step-by-step guide to test the workflow automation system.

---

## 📋 Prerequisites

1. Backend running: `npm run dev` (port 3000)
2. Frontend running: `npm run dev` (port 5173)
3. Logged in as admin: `admin@example.com` / `admin123`

---

## 🎯 Test Scenario 1: Lead Auto-Assignment

**Goal:** When a high-value lead is created, automatically:
- Add "Hot Lead" tag
- Create a follow-up task
- Send notification

### Step 1: Create Workflow

1. Open browser: `http://localhost:5173/automation/workflows`
2. Click **"New Workflow"** button
3. Fill in:
   - **Name:** `Hot Lead Auto-Assignment`
   - **Description:** `Automatically handle high-value leads`
   - **Trigger:** Select `Lead Created`
4. Click **"Create Workflow"**

### Step 2: Add Actions

**Action 1 - Add Tag:**
1. Click **"Add Action"** button
2. Select **Action Type:** `Add Tag`
3. **Tag:** `Hot Lead`
4. Click **"Add Action"**

**Action 2 - Create Task:**
1. Click **"Add Action"** again
2. Select **Action Type:** `Create Task`
3. Fill in:
   - **Task Title:** `Follow up: {{title}}`
   - **Priority:** `High`
   - **Due in (days):** `1`
4. Click **"Add Action"**

**Action 3 - Send Notification:**
1. Click **"Add Action"** again
2. Select **Action Type:** `Send Notification` (if available)
3. Or use **Create Activity** instead:
   - **Action Type:** `Create Activity`
4. Click **"Add Action"**

### Step 3: Activate Workflow

1. Toggle the switch at top to **ON** (green)
2. Workflow is now active!

### Step 4: Test the Workflow

**Option A - Manual Test:**
1. Click **"Test"** button
2. Click **"Run Test"**
3. Switch to **"History"** tab
4. You should see execution with status "completed"

**Option B - Real Test (Create Lead):**
1. Go to: `http://localhost:5173/crm/leads`
2. Click **"Add Lead"** button
3. Fill in:
   - **First Name:** `John`
   - **Last Name:** `Doe`
   - **Email:** `john@example.com`
   - **Value:** `50000` (high value)
   - **Source:** `Website`
4. Click **"Save"**

### Step 5: Verify Results

**Check Workflow Execution:**
1. Go back to: `http://localhost:5173/automation/workflows`
2. Click on your workflow
3. Switch to **"History"** tab
4. You should see new execution with:
   - Status: ✅ Completed
   - 3 steps completed
   - Execution time

**Check Task Created:**
1. Go to: `http://localhost:5173/tasks`
2. You should see new task: "Follow up: John Doe"
3. Priority: High
4. Due date: Tomorrow

**Check Lead Tagged:**
1. Go to: `http://localhost:5173/crm/leads`
2. Find "John Doe" lead
3. Should have "Hot Lead" tag

---

## 🎯 Test Scenario 2: Deal Stage Change Automation

**Goal:** When deal moves to "Proposal" stage, automatically:
- Change priority to high
- Create task for sending proposal
- Update a custom field

### Step 1: Create Workflow

1. Click **"New Workflow"**
2. Fill in:
   - **Name:** `Proposal Stage Automation`
   - **Description:** `Auto-actions when deal reaches proposal stage`
   - **Trigger:** Select `Deal Stage Changed`
3. Click **"Create Workflow"**

### Step 2: Add Actions

**Action 1 - Update Field:**
1. Click **"Add Action"**
2. Select **Action Type:** `Update Field`
3. Fill in:
   - **Field:** `priority`
   - **Value:** `high`
4. Click **"Add Action"**

**Action 2 - Create Task:**
1. Click **"Add Action"**
2. Select **Action Type:** `Create Task`
3. Fill in:
   - **Task Title:** `Send proposal for {{title}}`
   - **Priority:** `High`
   - **Due in (days):** `1`
4. Click **"Add Action"**

### Step 3: Activate & Test

1. Toggle workflow **ON**
2. Go to: `http://localhost:5173/crm/deals`
3. Create or edit a deal
4. Change **Stage** to `Proposal`
5. Save the deal

### Step 4: Verify

1. Check workflow history - should show execution
2. Check tasks - should have "Send proposal" task
3. Check deal - priority should be "high"

---

## 🎯 Test Scenario 3: Email Automation (If SMTP Configured)

**Goal:** Send welcome email to new contacts

### Step 1: Configure Email (Optional)

Edit `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Restart backend: `npm run dev`

### Step 2: Create Workflow

1. **Name:** `Welcome Email Automation`
2. **Trigger:** `Contact Created`
3. **Action:** `Send Email`
   - **Subject:** `Welcome {{first_name}}!`
   - **Body:** `Hi {{first_name}}, welcome to our CRM!`

### Step 3: Test

1. Create new contact
2. Check email inbox
3. Check workflow history

---

## 🎯 Test Scenario 4: Webhook Integration

**Goal:** Send notification to Slack when deal is won

### Step 1: Get Slack Webhook URL

1. Go to: https://api.slack.com/messaging/webhooks
2. Create incoming webhook
3. Copy webhook URL

### Step 2: Create Workflow

1. **Name:** `Deal Won Slack Notification`
2. **Trigger:** `Deal Won`
3. **Action:** `Send Webhook`
   - **Webhook URL:** `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

### Step 3: Test

1. Create a deal
2. Change stage to "Won"
3. Check Slack channel for notification
4. Check workflow history

---

## 🎯 Test Scenario 5: Multiple Actions Chain

**Goal:** Complex workflow with multiple steps

### Workflow: Complete Lead Nurturing

**Trigger:** Lead Created

**Actions:**
1. **Add Tag:** `New Lead`
2. **Create Task:** `Initial contact with {{first_name}}`
3. **Update Field:** 
   - Field: `stage`
   - Value: `contacted`
4. **Create Activity:** Log that workflow ran
5. **Send Email:** Welcome email (if SMTP configured)

### Test:
1. Create lead
2. Verify all 5 actions executed
3. Check each result individually

---

## 🔍 Debugging Failed Workflows

### If Workflow Doesn't Trigger:

1. **Check if workflow is active:**
   - Green dot should be visible
   - Toggle should be ON

2. **Check trigger type matches:**
   - Creating lead → use "Lead Created"
   - Updating lead → use "Lead Updated"

3. **Check conditions (if any):**
   - Value must match exactly
   - Field names are case-sensitive

### If Actions Fail:

1. **Check execution history:**
   - Click workflow → History tab
   - Look for error messages

2. **Common issues:**
   - Missing required fields
   - Invalid email addresses
   - Webhook URL incorrect
   - SMTP not configured

3. **Check backend logs:**
   ```bash
   # In backend terminal, you'll see:
   [Workflow] Started "Workflow Name"
   [Action] Created task: "Task Title"
   [Workflow] Execution completed
   ```

---

## 📊 Monitoring Workflows

### Real-time Monitoring:

1. Keep workflow page open
2. History tab auto-refreshes
3. Watch executions appear in real-time

### Check Execution Details:

1. Click on any execution
2. See:
   - Status (completed/failed/running)
   - Start time
   - Duration
   - Each step status
   - Error messages (if any)

---

## 🎨 Advanced Testing

### Test with Conditions:

Create workflow with conditions:
```json
{
  "conditions": [
    {
      "field": "value",
      "operator": "greater_than",
      "value": 10000
    }
  ]
}
```

Only triggers if lead value > 10000

### Test Template Variables:

Use in action configs:
- `{{entity.first_name}}` - Lead's first name
- `{{entity.last_name}}` - Lead's last name
- `{{entity.email}}` - Lead's email
- `{{entity.value}}` - Lead's value
- `{{entity.title}}` - Deal title

### Test Multiple Workflows:

1. Create 3-4 workflows
2. All with same trigger
3. All should execute when triggered

---

## ✅ Success Checklist

After testing, you should have:

- [ ] Created at least 2 workflows
- [ ] Activated workflows
- [ ] Triggered workflows (manual or real)
- [ ] Seen executions in history
- [ ] Verified actions executed (tasks created, tags added, etc.)
- [ ] Checked execution details
- [ ] Tested failed scenario (wrong config)
- [ ] Monitored real-time execution

---

## 🐛 Common Issues & Solutions

### Issue: "Workflow not triggering"
**Solution:** 
- Ensure workflow is active (green toggle)
- Check trigger type matches action
- Verify org_id matches

### Issue: "Actions failing"
**Solution:**
- Check action config is valid
- Verify required fields present
- Check backend logs for errors

### Issue: "Email not sending"
**Solution:**
- Verify SMTP configured in .env
- Check email address is valid
- Test SMTP connection

### Issue: "Webhook failing"
**Solution:**
- Verify webhook URL is correct
- Check webhook endpoint is accessible
- Test webhook manually with curl

---

## 📞 Need Help?

If workflows aren't working:

1. Check backend terminal for errors
2. Check browser console for errors
3. Verify database has required tables
4. Check API endpoints are responding

---

## 🎉 You're Done!

If you completed all test scenarios, your automation system is fully functional and ready for production use!

**Next Steps:**
- Create workflows for your real use cases
- Set up scheduled workflows
- Configure email/webhook integrations
- Train team on using workflows
