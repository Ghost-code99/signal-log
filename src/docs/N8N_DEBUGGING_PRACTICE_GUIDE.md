# n8n Workflow Debugging Practice Guide

**Complete guide to practice debugging n8n workflows by intentionally breaking one**

---

## Overview

This exercise will teach you:
1. How to intentionally break a workflow (invalid OpenRouter model)
2. How to trigger the workflow from your app
3. How to find failed executions in n8n
4. How to identify which node failed
5. How to read error messages
6. How to view node input/output data
7. How to fix the issue
8. How to re-run and verify the fix

---

## Step 1: Intentionally Break the Workflow

### What We'll Break

We'll change the OpenRouter model name to something invalid. This is a common mistake when:
- Copying model names incorrectly
- Using a model that doesn't exist
- Typo in model name
- Model was deprecated/removed

### How to Break It

1. **Open your n8n workflow:**
   - Go to your n8n instance
   - Open the feedback workflow (Chat Trigger → AI Agent → Gmail → HTTP Request)

2. **Find the AI Agent node:**
   - This is the OpenRouter node that processes feedback
   - Click on it to open settings

3. **Find the Model field:**
   - Look for "Model" or "Model Name" field
   - Current value might be: `openai/gpt-4` or `anthropic/claude-3-opus` or similar

4. **Change to invalid model:**
   - Change to: `openai/invalid-model-name-12345`
   - Or: `this-model-does-not-exist`
   - Or: `gpt-999` (doesn't exist)

5. **Save the workflow:**
   - Click "Save" button
   - Workflow is now broken!

### Why This Will Fail

- OpenRouter will try to call the model
- Model doesn't exist
- OpenRouter returns error: "Model not found" or similar
- AI Agent node fails
- Workflow stops

---

## Step 2: Trigger the Workflow from Your App

### Method 1: Submit Feedback Through App

1. **Go to production site:**
   - Visit: `https://your-domain.com`
   - Or your Vercel domain

2. **Submit feedback:**
   - Click "Give Feedback" button
   - Enter message: "Testing n8n debugging"
   - Click "Submit"

3. **Expected:**
   - Form might show success (webhook was received)
   - But n8n workflow will fail
   - No email will be sent (workflow stopped)

### Method 2: Direct Webhook Call (Alternative)

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Testing n8n debugging",
    "browser": "curl",
    "url": "https://example.com",
    "timestamp": "2025-01-15T10:00:00Z"
  }'
```

**Expected:**
- Webhook receives request (success)
- n8n workflow starts
- AI Agent node fails
- Workflow stops

---

## Step 3: Find Failed Execution in n8n

### Access Execution History

1. **Go to n8n dashboard:**
   - Open your n8n instance
   - You should see your workflows

2. **Open your workflow:**
   - Click on the feedback workflow
   - You'll see the workflow canvas

3. **Open Execution History:**
   - Look for "Executions" tab (usually at top or bottom)
   - Or click "Executions" in sidebar
   - Or look for clock/history icon

### Identify Failed Execution

**What to look for:**

1. **Status indicators:**
   - ✅ **Green checkmark** = Success
   - ❌ **Red X** = Failed
   - ⏳ **Spinner** = Running
   - ⚠️ **Yellow warning** = Partial failure

2. **Failed execution:**
   - Should have red X or "Error" status
   - Timestamp matches when you triggered it
   - Usually at the top of the list (most recent)

3. **Click on the failed execution:**
   - Opens execution details
   - Shows all nodes and their status

---

## Step 4: Identify Which Node Failed

### View Execution Details

After clicking on the failed execution, you'll see:

1. **Execution timeline:**
   - Shows all nodes in order
   - Each node has a status indicator

2. **Node statuses:**
   - ✅ **Green** = Success
   - ❌ **Red** = Failed
   - ⏳ **Gray** = Not executed (stopped before reaching it)
   - ⚠️ **Yellow** = Warning

### Find the Failed Node

**Look for:**
- First red node in the timeline
- This is where the workflow stopped
- Usually the AI Agent node (OpenRouter)

**Visual indicators:**
- Red border around the node
- Error icon on the node
- "Error" text next to node name

### Common Failure Points

1. **Webhook node:** Usually succeeds (receives request)
2. **AI Agent node:** **This is likely where it fails** (invalid model)
3. **Gmail node:** Won't execute (workflow stopped before it)
4. **HTTP Request node:** Won't execute (workflow stopped before it)

---

## Step 5: Read the Error Message

### Click on the Failed Node

1. **Click on the red/failed node:**
   - Usually the AI Agent (OpenRouter) node
   - Opens node details

2. **Find error message:**
   - Usually at top of node details
   - Red text or error icon
   - Clear error message

### Example Error Messages

**Invalid model:**
```
Error: Model 'openai/invalid-model-name-12345' not found
```

**API error:**
```
Error: 404 Not Found - Model does not exist
```

**Authentication error:**
```
Error: Invalid API key
```

**Rate limit:**
```
Error: Rate limit exceeded
```

### Understanding the Error

**Error structure:**
- **Error type:** What went wrong (Model not found, API error, etc.)
- **Error message:** Specific details
- **Error code:** HTTP status code (404, 401, 429, etc.)

**What it tells you:**
- **Model not found:** Model name is wrong
- **401 Unauthorized:** API key issue
- **429 Too Many Requests:** Rate limit
- **500 Server Error:** OpenRouter issue

---

## Step 6: View Node Input/Output

### View Input Data

1. **Click on the failed node:**
   - Opens node details panel

2. **Find "Input" tab or section:**
   - Shows data that came INTO this node
   - Usually from previous node (Webhook)

3. **View input data:**
   - Should show webhook payload
   - `userId`, `firstName`, `lastName`, `email`, `message`, etc.
   - This is what the node received

**Example input:**
```json
{
  "body": {
    "userId": "test-123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Testing n8n debugging",
    "browser": "curl",
    "url": "https://example.com",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

### View Output Data

1. **Find "Output" tab or section:**
   - Shows what the node tried to produce
   - For failed nodes, might be empty or show partial data

2. **View error details:**
   - Error message
   - Stack trace (if available)
   - Request/response details

**Example output (for failed node):**
```json
{
  "error": {
    "message": "Model 'openai/invalid-model-name-12345' not found",
    "code": 404,
    "details": "..."
  }
}
```

### View Previous Node Output

**To see what worked:**
1. **Click on previous node** (Webhook)
2. **View its output:**
   - Should show successful webhook data
   - This confirms webhook worked
   - Problem started at AI Agent node

---

## Step 7: Fix the Issue

### Identify the Problem

**From error message:**
- Error: `Model 'openai/invalid-model-name-12345' not found`
- Problem: Invalid model name
- Solution: Change to valid model name

### Fix the Model Name

1. **Go back to workflow canvas:**
   - Click "Workflow" tab or back button
   - You'll see the workflow diagram

2. **Click on AI Agent node:**
   - Opens node settings

3. **Find Model field:**
   - Look for "Model" or "Model Name"
   - Currently shows invalid model

4. **Change to valid model:**
   - Use a valid OpenRouter model:
     - `openai/gpt-4`
     - `openai/gpt-3.5-turbo`
     - `anthropic/claude-3-opus`
     - `anthropic/claude-3-sonnet`
     - `google/gemini-pro`

5. **Save the workflow:**
   - Click "Save" button
   - Workflow is now fixed!

### Verify Model Name

**Check OpenRouter docs:**
- Visit: https://openrouter.ai/models
- Find valid model names
- Use exact format (e.g., `openai/gpt-4`, not `gpt-4`)

---

## Step 8: Re-run the Workflow

### Method 1: Re-run Failed Execution

1. **Go back to execution history:**
   - Click "Executions" tab
   - Find the failed execution

2. **Click "Re-run" or "Retry":**
   - Usually a button on the execution
   - Or right-click → "Re-run"

3. **Watch execution:**
   - New execution starts
   - Watch nodes turn green
   - Should complete successfully

### Method 2: Trigger New Execution

1. **Submit feedback again:**
   - Go to production site
   - Click "Give Feedback"
   - Submit: "Testing after fix"

2. **Watch n8n:**
   - New execution appears
   - Should complete successfully

### Verify Success

**Check execution:**
- ✅ All nodes should be green
- ✅ No red nodes
- ✅ Status: "Success"

**Check results:**
- ✅ Email sent (if Gmail node configured)
- ✅ HTTP Request node executed (if configured)
- ✅ All nodes have output data

**Check email:**
- Should receive Gmail notification
- Contains feedback + AI analysis

---

## Common n8n Error Patterns

### Pattern 1: Invalid Model Name

**Error:**
```
Model 'xxx' not found
```

**Fix:**
- Check model name spelling
- Use exact format from OpenRouter docs
- Verify model exists

### Pattern 2: API Key Issue

**Error:**
```
401 Unauthorized
Invalid API key
```

**Fix:**
- Check OpenRouter API key in n8n credentials
- Verify key is valid
- Regenerate if needed

### Pattern 3: Rate Limit

**Error:**
```
429 Too Many Requests
Rate limit exceeded
```

**Fix:**
- Wait before retrying
- Upgrade OpenRouter plan
- Reduce request frequency

### Pattern 4: Missing Field

**Error:**
```
Required field 'message' is missing
```

**Fix:**
- Check webhook payload
- Verify all required fields sent
- Check node mapping

### Pattern 5: JSON Parse Error

**Error:**
```
Unexpected token in JSON
```

**Fix:**
- Check webhook payload format
- Verify Content-Type header
- Validate JSON structure

---

## Debugging Tips

### Tip 1: Check Node Order

- Workflow executes top to bottom
- If node 2 fails, nodes 3+ won't execute
- Check previous nodes to see what worked

### Tip 2: Use Test Mode

- n8n has "Test workflow" feature
- Test individual nodes
- See input/output without full execution

### Tip 3: Add Debug Nodes

- Add "Set" node to log data
- Add "Code" node to inspect variables
- Add "HTTP Request" node to test APIs

### Tip 4: Check Node Settings

- Verify all required fields filled
- Check credentials are valid
- Ensure node is enabled (not disabled)

### Tip 5: View Execution Logs

- n8n shows detailed logs
- Check each node's logs
- Look for warnings (yellow)

---

## Exercise Checklist

- [ ] Intentionally break workflow (invalid model)
- [ ] Trigger workflow from app
- [ ] Find failed execution in n8n
- [ ] Identify which node failed
- [ ] Read error message
- [ ] View node input/output
- [ ] Fix the issue (correct model name)
- [ ] Re-run workflow
- [ ] Verify it works

---

## Summary

**Key Takeaways:**

1. **Break workflow:** Change model to invalid name
2. **Find execution:** Executions tab → Look for red X
3. **Identify failed node:** First red node in timeline
4. **Read error:** Click node → View error message
5. **View data:** Check input/output tabs
6. **Fix:** Correct the model name
7. **Re-run:** Retry execution or trigger new one
8. **Verify:** All nodes green, email sent

**Common errors:**
- Invalid model name
- API key issues
- Rate limits
- Missing fields
- JSON parse errors

**Debugging skills:**
- Reading error messages
- Understanding node execution order
- Viewing input/output data
- Identifying root cause
- Fixing and verifying

---

**Ready to practice?** Follow the steps above! 🚀

**Good luck debugging!** 🐛🔍

