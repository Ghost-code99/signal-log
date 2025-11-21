# n8n Debugging Exercise - Complete Summary

**Everything you need to practice debugging n8n workflows**

---

## Exercise Overview

**Goal:** Learn to debug n8n workflows by intentionally breaking one and fixing it.

**What you'll do:**
1. Break workflow (invalid OpenRouter model)
2. Trigger it from your app
3. Find the failed execution
4. Identify which node failed
5. Read the error message
6. View node input/output
7. Fix the issue
8. Re-run and verify

---

## Step 1: Break the Workflow ✅

### What to Do

1. **Open n8n workflow**
2. **Click AI Agent node** (OpenRouter)
3. **Find "Model" field**
4. **Change to invalid model:**
   ```
   openai/invalid-model-name-12345
   ```
5. **Save workflow**

### Why It Fails

- Model doesn't exist
- OpenRouter returns 404
- AI Agent node fails
- Workflow stops

---

## Step 2: Trigger from App

### Method 1: Through App (Recommended)

1. Go to production site
2. Click "Give Feedback"
3. Submit: "Testing n8n debugging"
4. Form might show success, but workflow will fail

### Method 2: Direct curl

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","firstName":"Test","lastName":"User","email":"test@example.com","message":"Testing","browser":"curl","url":"https://example.com","timestamp":"2025-01-15T10:00:00Z"}'
```

---

## Step 3: Find Failed Execution

### In n8n

1. **Click "Executions" tab**
2. **Look for red X** (failed execution)
3. **Click on it**

### What to Look For

- ❌ Red X = Failed
- ✅ Green check = Success
- Timestamp matches when you triggered

---

## Step 4: Identify Failed Node

### View Execution Timeline

**You'll see:**
```
✅ Webhook        (Success)
❌ AI Agent       (Failed) ← This is where it failed
⏳ Gmail          (Not executed)
⏳ HTTP Request   (Not executed)
```

**First red node = where it failed**

---

## Step 5: Read Error Message

### Click on Failed Node

**Error message:**
```
Error: Model 'openai/invalid-model-name-12345' not found
```

**What it means:**
- Model name is wrong
- Need to fix model name

---

## Step 6: View Input/Output

### Input Tab

**Shows data that came in:**
```json
{
  "body": {
    "userId": "test",
    "message": "Testing",
    ...
  }
}
```

### Output Tab

**Shows error details:**
```json
{
  "error": {
    "message": "Model not found",
    "code": 404
  }
}
```

---

## Step 7: Fix the Issue

### In Workflow

1. **Go back to workflow canvas**
2. **Click AI Agent node**
3. **Find "Model" field**
4. **Change to valid model:**
   - `openai/gpt-4`
   - `openai/gpt-3.5-turbo`
   - `anthropic/claude-3-opus`
5. **Save**

---

## Step 8: Re-run and Verify

### Re-run Failed Execution

1. **Go to Executions tab**
2. **Click "Re-run" on failed execution**
3. **Watch it succeed**

### Or Trigger New

1. **Submit feedback again**
2. **New execution should succeed**

### Verify

- ✅ All nodes green
- ✅ Email sent
- ✅ No errors

---

## Common Errors Reference

### Invalid Model
- **Error:** `Model 'xxx' not found`
- **Fix:** Use valid model name

### API Key
- **Error:** `401 Unauthorized`
- **Fix:** Check OpenRouter API key

### Rate Limit
- **Error:** `429 Too Many Requests`
- **Fix:** Wait or upgrade plan

### Missing Field
- **Error:** `Required field missing`
- **Fix:** Check webhook payload

---

## Debugging Tips

1. **Check node order:** First red node = where it failed
2. **View input/output:** See what data each node received
3. **Read error messages:** They tell you exactly what's wrong
4. **Test individual nodes:** Use "Test workflow" feature
5. **Check credentials:** Verify API keys are valid

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

## Documentation

**Detailed guides:**
- `N8N_DEBUGGING_PRACTICE_GUIDE.md` - Complete guide
- `N8N_DEBUGGING_STEP_BY_STEP.md` - Visual walkthrough
- `N8N_DEBUGGING_QUICK_REFERENCE.md` - Quick commands

---

## What You'll Learn

### ✅ Skills

1. How to intentionally break workflows
2. How to find failed executions
3. How to identify failed nodes
4. How to read error messages
5. How to view node data
6. How to fix issues
7. How to re-run workflows
8. How to verify fixes

### 🎯 Patterns

- Invalid model names
- API key issues
- Rate limits
- Missing fields
- JSON parse errors

---

## Next Steps

1. **Complete the exercise:**
   - Follow steps 1-8 above
   - Practice finding and fixing errors

2. **Try other errors:**
   - Invalid API key
   - Missing webhook field
   - Gmail configuration error

3. **Monitor workflows:**
   - Check executions regularly
   - Fix issues proactively

---

**Ready to practice?** Follow the steps above! 🚀

**Good luck debugging!** 🐛🔍

