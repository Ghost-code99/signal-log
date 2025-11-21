# n8n Debugging Quick Reference

**Quick commands and tips for debugging n8n workflows**

---

## Current Exercise: Break Workflow with Invalid Model

**What to do:**
1. Open AI Agent node in n8n
2. Change model to: `openai/invalid-model-12345`
3. Save workflow
4. Trigger from app
5. Find error in n8n

---

## Step 1: Break the Workflow

**In n8n:**
1. Open workflow
2. Click AI Agent node
3. Find "Model" field
4. Change to: `openai/invalid-model-12345`
5. Save

**Why it fails:**
- Model doesn't exist
- OpenRouter returns 404
- Node fails

---

## Step 2: Trigger from App

**Option A: Through App**
- Go to production site
- Click "Give Feedback"
- Submit: "Testing n8n debugging"

**Option B: curl**
```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","firstName":"Test","lastName":"User","email":"test@example.com","message":"Testing","browser":"curl","url":"https://example.com","timestamp":"2025-01-15T10:00:00Z"}'
```

---

## Step 3: Find Failed Execution

**In n8n:**
1. Click "Executions" tab
2. Look for red X (failed)
3. Click on failed execution

**What to look for:**
- Red X = Failed
- Green check = Success
- Timestamp matches when you triggered

---

## Step 4: Identify Failed Node

**In execution view:**
- Timeline shows all nodes
- First red node = where it failed
- Usually AI Agent node

**Visual:**
- ✅ Webhook (green)
- ❌ AI Agent (red) ← Failed here
- ⏳ Gmail (gray, not executed)
- ⏳ HTTP Request (gray, not executed)

---

## Step 5: Read Error Message

**Click on red node:**
- Opens node details
- Error message at top
- Usually red text

**Example error:**
```
Error: Model 'openai/invalid-model-12345' not found
```

**What it means:**
- Model name is wrong
- Need to fix model name

---

## Step 6: View Input/Output

**Click on failed node:**
- "Input" tab = data that came in
- "Output" tab = error details

**Input example:**
```json
{
  "body": {
    "userId": "test",
    "message": "Testing",
    ...
  }
}
```

**Output example:**
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

**In workflow:**
1. Go back to workflow canvas
2. Click AI Agent node
3. Find "Model" field
4. Change to valid model:
   - `openai/gpt-4`
   - `openai/gpt-3.5-turbo`
   - `anthropic/claude-3-opus`
5. Save

---

## Step 8: Re-run Workflow

**Option A: Re-run failed execution**
- Click "Re-run" on failed execution
- Watch it succeed

**Option B: Trigger new**
- Submit feedback again
- New execution should succeed

**Verify:**
- ✅ All nodes green
- ✅ Email sent
- ✅ No errors

---

## Common Errors

**Invalid model:**
- Error: `Model 'xxx' not found`
- Fix: Use valid model name

**API key:**
- Error: `401 Unauthorized`
- Fix: Check OpenRouter API key

**Rate limit:**
- Error: `429 Too Many Requests`
- Fix: Wait or upgrade plan

**Missing field:**
- Error: `Required field missing`
- Fix: Check webhook payload

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

**Ready to practice?** Follow the steps above! 🚀

