# n8n Debugging - Step by Step Walkthrough

**Visual step-by-step guide with screenshots descriptions**

---

## Step 1: Intentionally Break the Workflow

### 1.1 Open Your n8n Workflow

1. **Go to n8n dashboard**
   - Open your n8n instance URL
   - You'll see list of workflows

2. **Open feedback workflow**
   - Click on your feedback workflow
   - You'll see the workflow canvas with nodes

**Visual:**
```
┌─────────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────────┐
│   Webhook   │───▶│  AI Agent    │───▶│  Gmail   │───▶│ HTTP Request │
│   Trigger   │    │ (OpenRouter) │    │          │    │              │
└─────────────┘    └──────────────┘    └──────────┘    └──────────────┘
```

### 1.2 Find AI Agent Node

- **Look for:** Node labeled "AI Agent" or "OpenRouter"
- **Location:** Usually second node (after Webhook)
- **Click on it** to open settings

### 1.3 Find Model Field

**In node settings, look for:**
- "Model" field
- "Model Name" field
- "OpenRouter Model" field

**Current value might be:**
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`
- Or similar valid model

### 1.4 Change to Invalid Model

**Change the model name to:**
```
openai/invalid-model-name-12345
```

**Or:**
```
this-model-does-not-exist
```

**Or:**
```
gpt-999
```

**Important:** Make it clearly invalid so you can identify it later.

### 1.5 Save Workflow

1. **Click "Save" button** (usually top-right)
2. **Workflow is now broken!**
3. **Keep workflow activated** (toggle should be ON)

---

## Step 2: Trigger the Workflow

### 2.1 Go to Production Site

1. **Open your production URL:**
   - `https://your-domain.com`
   - Or your Vercel domain

2. **Navigate to feedback form:**
   - Look for "Give Feedback" button
   - Usually in header or footer

### 2.2 Submit Feedback

1. **Click "Give Feedback" button**
   - Modal/form opens

2. **Enter test message:**
   ```
   Testing n8n debugging - this should fail
   ```

3. **Click "Submit"**

### 2.3 Expected Result

**What happens:**
- ✅ Form might show "Success" (webhook was received)
- ❌ But n8n workflow will fail
- ❌ No email will be sent
- ❌ No callback to your app

**This is expected!** The webhook received the request, but the workflow failed at the AI Agent node.

---

## Step 3: Find Failed Execution in n8n

### 3.1 Open Execution History

**In n8n workflow view:**

1. **Look for "Executions" tab**
   - Usually at top of screen
   - Or in sidebar
   - Or click clock/history icon

2. **Click "Executions"**

**You'll see a list of executions:**
```
┌─────────────────────────────────────────────────┐
│ Executions                                      │
├─────────────────────────────────────────────────┤
│ ❌ Failed    | 2025-01-15 10:05:23 | 2 nodes   │ ← Click this
│ ✅ Success   | 2025-01-15 10:00:15 | 4 nodes   │
│ ✅ Success   | 2025-01-15 09:55:42 | 4 nodes   │
└─────────────────────────────────────────────────┘
```

### 3.2 Identify Failed Execution

**Look for:**
- ❌ **Red X icon** = Failed
- **Timestamp** matches when you submitted feedback
- **Status:** "Error" or "Failed"
- **Usually at top** (most recent)

### 3.3 Click on Failed Execution

**Click on the failed execution row**

**You'll see execution details:**
```
┌─────────────────────────────────────────────────┐
│ Execution Details                               │
├─────────────────────────────────────────────────┤
│ Status: ❌ Failed                               │
│ Started: 2025-01-15 10:05:23                   │
│ Duration: 2.3s                                  │
│                                                  │
│ Node Timeline:                                  │
│ ✅ Webhook        | Success | 0.5s              │
│ ❌ AI Agent       | Error   | 1.8s  ← Failed   │
│ ⏳ Gmail          | Not run | -                 │
│ ⏳ HTTP Request   | Not run | -                 │
└─────────────────────────────────────────────────┘
```

---

## Step 4: Identify Which Node Failed

### 4.1 View Node Timeline

**In execution details, you'll see:**

**Visual timeline:**
```
✅ Webhook Trigger    (Success - green)
   │
   ▼
❌ AI Agent          (Failed - red) ← THIS IS WHERE IT FAILED
   │
   ▼
⏳ Gmail             (Not executed - gray)
   │
   ▼
⏳ HTTP Request      (Not executed - gray)
```

### 4.2 Identify Failed Node

**Look for:**
- **First red node** in timeline
- **Error icon** on the node
- **"Error" status** next to node name

**In this exercise:**
- ✅ Webhook succeeded (received request)
- ❌ **AI Agent failed** (invalid model)
- ⏳ Gmail didn't run (stopped before it)
- ⏳ HTTP Request didn't run (stopped before it)

**The failed node is: AI Agent**

---

## Step 5: Read the Error Message

### 5.1 Click on Failed Node

**Click on the red/failed node** (AI Agent)

**Node details panel opens:**
```
┌─────────────────────────────────────────────────┐
│ AI Agent Node                                   │
├─────────────────────────────────────────────────┤
│ ❌ Error                                        │
│                                                  │
│ Error: Model 'openai/invalid-model-name-12345' │
│        not found                                 │
│                                                  │
│ Status Code: 404                                 │
│ Error Type: ModelNotFoundError                  │
└─────────────────────────────────────────────────┘
```

### 5.2 Read Error Message

**Error message:**
```
Error: Model 'openai/invalid-model-name-12345' not found
```

**Breaking it down:**
- **Error type:** Model not found
- **What:** Tried to use model `openai/invalid-model-name-12345`
- **Why:** Model doesn't exist
- **Status:** 404 (Not Found)

### 5.3 Understand the Error

**What it tells you:**
- ✅ Webhook worked (received request)
- ❌ AI Agent failed (model doesn't exist)
- ❌ Workflow stopped (didn't continue to Gmail)

**Root cause:**
- Invalid model name in AI Agent node
- Need to change to valid model

---

## Step 6: View Node Input/Output

### 6.1 View Input Data

**In node details panel:**

1. **Click "Input" tab** (or section)
2. **View input data:**

```json
{
  "body": {
    "userId": "test-123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Testing n8n debugging - this should fail",
    "browser": "Mozilla/5.0...",
    "url": "https://your-domain.com",
    "timestamp": "2025-01-15T10:05:23Z"
  }
}
```

**This shows:**
- What data the node received
- Confirms webhook sent data correctly
- Problem is in AI Agent processing, not data

### 6.2 View Output Data

**Click "Output" tab** (or section)

**For failed nodes, you'll see:**
```json
{
  "error": {
    "message": "Model 'openai/invalid-model-name-12345' not found",
    "code": 404,
    "type": "ModelNotFoundError",
    "details": {
      "model": "openai/invalid-model-name-12345",
      "available_models": ["openai/gpt-4", "openai/gpt-3.5-turbo", ...]
    }
  }
}
```

**This shows:**
- Exact error details
- What went wrong
- Sometimes suggests fixes

### 6.3 View Previous Node Output

**To see what worked:**

1. **Click on Webhook node** (previous node)
2. **View its output:**
   - Should show successful webhook data
   - Confirms webhook received request
   - Data is correct

**This confirms:**
- ✅ Webhook node worked
- ❌ Problem started at AI Agent node

---

## Step 7: Fix the Issue

### 7.1 Go Back to Workflow

**Click "Workflow" tab** or back button

**You'll see workflow canvas again:**
```
┌─────────────┐    ┌──────────────┐    ┌──────────┐
│   Webhook   │───▶│  AI Agent    │───▶│  Gmail   │
│   Trigger   │    │ (OpenRouter) │    │          │
└─────────────┘    └──────────────┘    └──────────┘
```

### 7.2 Open AI Agent Node

**Click on AI Agent node** to open settings

### 7.3 Find Model Field

**Look for "Model" field**

**Current value:**
```
openai/invalid-model-name-12345
```

### 7.4 Change to Valid Model

**Change to a valid OpenRouter model:**

**Popular options:**
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `google/gemini-pro`

**Example:**
```
openai/gpt-4
```

### 7.5 Save Workflow

1. **Click "Save" button**
2. **Workflow is now fixed!**
3. **Keep workflow activated**

---

## Step 8: Re-run the Workflow

### 8.1 Method 1: Re-run Failed Execution

**In execution history:**

1. **Go back to "Executions" tab**
2. **Find the failed execution**
3. **Click "Re-run" or "Retry" button**
   - Usually on the execution row
   - Or right-click → "Re-run"

**Watch the execution:**
```
┌─────────────────────────────────────────────────┐
│ Re-running Execution...                         │
├─────────────────────────────────────────────────┤
│ ✅ Webhook        | Success | 0.5s              │
│ ⏳ AI Agent       | Running | ...                │
│ ⏳ Gmail          | Waiting | -                 │
│ ⏳ HTTP Request   | Waiting | -                 │
└─────────────────────────────────────────────────┘
```

**Should complete successfully:**
```
✅ Webhook        | Success | 0.5s
✅ AI Agent       | Success | 2.1s  ← Now works!
✅ Gmail          | Success | 1.2s
✅ HTTP Request   | Success | 0.8s
```

### 8.2 Method 2: Trigger New Execution

**Submit feedback again:**

1. **Go to production site**
2. **Click "Give Feedback"**
3. **Submit:** "Testing after fix"
4. **Watch n8n:**
   - New execution appears
   - Should complete successfully

### 8.3 Verify Success

**Check execution:**
- ✅ All nodes should be green
- ✅ Status: "Success"
- ✅ No red nodes

**Check results:**
- ✅ Email sent (check inbox)
- ✅ HTTP Request executed (check your app logs)
- ✅ All nodes have output data

**Check email:**
- Should receive Gmail notification
- Contains feedback + AI analysis
- All fields populated correctly

---

## Visual Summary

### Before Fix (Broken)
```
✅ Webhook        → Success
❌ AI Agent       → Error: Model not found
⏳ Gmail          → Not executed
⏳ HTTP Request   → Not executed
```

### After Fix (Working)
```
✅ Webhook        → Success
✅ AI Agent       → Success (valid model)
✅ Gmail          → Success (email sent)
✅ HTTP Request   → Success (callback sent)
```

---

## What You Learned

### ✅ Key Skills

1. **Breaking workflows:** Change model to invalid name
2. **Finding executions:** Executions tab → Look for red X
3. **Identifying failed nodes:** First red node in timeline
4. **Reading errors:** Click node → View error message
5. **Viewing data:** Check input/output tabs
6. **Fixing issues:** Correct the model name
7. **Re-running:** Retry execution or trigger new
8. **Verifying:** All nodes green, email sent

### 🎯 Common Patterns

**Pattern 1: Invalid Model**
- Error: `Model 'xxx' not found`
- Fix: Use valid model name

**Pattern 2: API Key**
- Error: `401 Unauthorized`
- Fix: Check OpenRouter API key

**Pattern 3: Rate Limit**
- Error: `429 Too Many Requests`
- Fix: Wait or upgrade plan

---

## Exercise Checklist

- [ ] Break workflow (invalid model)
- [ ] Trigger from app
- [ ] Find failed execution
- [ ] Identify failed node
- [ ] Read error message
- [ ] View input/output
- [ ] Fix the issue
- [ ] Re-run and verify

---

**Ready to practice?** Follow the steps above! 🚀

**Good luck debugging!** 🐛🔍

