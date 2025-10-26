# Security Monitoring Guide

## Overview

This guide will help you establish good security monitoring habits for your Supabase database using our automated monitoring system.

## 🎯 Quick Start

### 1. Run Your First Security Check

```bash
# Manual check
npm run security:monitor check

# Or via API
curl http://localhost:3001/api/security-monitoring?action=check
```

### 2. View Active Alerts

```bash
# Check for alerts
npm run security:monitor alerts

# Or via API
curl http://localhost:3001/api/security-monitoring?action=alerts
```

### 3. Generate a Report

```bash
# Generate report
npm run security:monitor report

# Or via API
curl http://localhost:3001/api/security-monitoring?action=report
```

## 📅 Recommended Monitoring Schedule

### Daily (2 minutes)
- Check Security Advisor dashboard
- Review active alerts
- Quick scan for new findings

**Quick Command:**
```bash
npm run security:monitor alerts
```

### Weekly (10 minutes)
- Run full security scan
- Review trends and improvements
- Update security documentation
- Check resolved issues

**Quick Commands:**
```bash
npm run security:monitor check
npm run security:monitor trends
npm run security:monitor report
```

### Monthly (30 minutes)
- Comprehensive security review
- Rotate API keys
- Update security policies
- Audit user access
- Review and update RLS policies

## 🤖 Automated Monitoring

### Start Automated Monitoring

The monitoring system can run automatically and check your security every hour:

```bash
# Start monitoring (checks every hour)
npm run security:monitor start

# Stop monitoring
npm run security:monitor stop
```

### Alert Conditions

Automated monitoring will alert you when:

1. **Security score drops below 60** - Critical threshold
2. **New critical findings detected** - Immediate attention needed
3. **Score drops by more than 10 points** - Significant degradation

### Manual Check

Trigger a security check manually:

```bash
npm run security:monitor check
```

## 📊 Tracking Security Improvements

### View Trends

```bash
npm run security:monitor trends
```

This shows:
- Security score over time
- Number of findings over time
- Improvement trends

### Generate Reports

```bash
npm run security:monitor report
```

The report includes:
- Current security score
- Total findings breakdown
- Trend analysis
- Active alerts
- Recommendations

## 🔔 Setting Up Alerts

### Current Alert System

The system automatically alerts on:
- Critical security scores (< 60)
- New critical findings
- Significant score drops (> 10 points)

### Integration Options (Future)

You can extend alerting to:

1. **Slack Integration**
```typescript
// Example: Slack webhook
async function sendSlackAlert(alert: SecurityAlert) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 ${alert.title}\n${alert.message}`
    })
  })
}
```

2. **Email Alerts**
```typescript
// Example: Email notification
async function sendEmailAlert(alert: SecurityAlert) {
  // Send email using your email service
}
```

3. **Discord Notifications**
```typescript
// Example: Discord webhook
async function sendDiscordAlert(alert: SecurityAlert) {
  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      embeds: [{
        title: alert.title,
        description: alert.message,
        color: 0xFF0000
      }]
    })
  })
}
```

## 📈 Security Score Tracking

### Weekly Tracking

Track your improvements:

| Week | Score | Findings | Changes Made |
|------|-------|----------|--------------|
| Week 1 | 65 | 8 | Initial setup |
| Week 2 | 75 | 6 | Enabled RLS |
| Week 3 | 85 | 4 | Configured MFA |
| Week 4 | 95 | 1 | Network restrictions |

### Monthly Review

At the end of each month:
1. Review overall trend
2. Identify areas for improvement
3. Plan next month's security goals
4. Rotate keys if needed
5. Update documentation

## 🛠️ CLI Commands Reference

### Check Commands

```bash
# Run security check
npm run security:monitor check

# Generate report
npm run security:monitor report

# Show trends
npm run security:monitor trends

# Show alerts
npm run security:monitor alerts
```

### Monitoring Commands

```bash
# Start automated monitoring
npm run security:monitor start

# Stop automated monitoring
npm run security:monitor stop
```

## 🔍 Weekly Security Routine

### Monday (5 minutes)
- Run security check
- Review dashboard
- Check for new alerts
- Prioritize issues for the week

```bash
npm run security:monitor check
npm run security:monitor alerts
```

### Wednesday (5 minutes)
- Follow up on Monday's issues
- Check progress on fixes
- Update Security Advisor

### Friday (10 minutes)
- Weekly summary review
- Generate report
- Plan next week's security tasks

```bash
npm run security:monitor report
```

## 📱 Browser-Based Monitoring

You can also monitor security via the Security Advisor dashboard:

1. Visit: `http://localhost:3001/security-advisor`
2. Click "Run Scan" for a quick check
3. Review findings and severity
4. Track improvements over time

## 🤖 Automated Checks (Advanced)

For production, you can set up cron jobs or scheduled tasks:

### Cron Example (Linux/Mac)

```bash
# Run check every day at 9 AM
0 9 * * * cd /path/to/your/app && npm run security:monitor check

# Generate weekly report every Monday at 8 AM
0 8 * * 1 cd /path/to/your/app && npm run security:monitor report > weekly-report.txt
```

### GitHub Actions Example

```yaml
name: Security Check
on:
  schedule:
    - cron: '0 9 * * *' # Every day at 9 AM
  workflow_dispatch:

jobs:
  security-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run security:monitor check
```

## 📊 Monitoring Dashboard

Access the Security Advisor dashboard for visual monitoring:

```
http://localhost:3001/security-advisor
```

Features:
- Real-time security score
- Visual trend charts
- Finding details
- One-click fixes
- Progress tracking

## 🎯 Best Practices

### 1. Consistent Schedule
- Pick a time each day for quick checks
- Same time each week for deep review
- Monthly comprehensive audit

### 2. Action on Alerts
- Critical alerts: Address within 24 hours
- High alerts: Address within 1 week
- Medium alerts: Address within 1 month

### 3. Document Changes
- Track what fixes you made
- Note improvement in score
- Document learning and best practices

### 4. Regular Review
- Weekly trend review
- Monthly comprehensive review
- Quarterly security audit

## 🔐 Security Monitoring Checklist

### Daily
- [ ] Check Security Advisor dashboard
- [ ] Review active alerts
- [ ] Quick scan for new issues

### Weekly
- [ ] Run full security check
- [ ] Review trends and improvements
- [ ] Update security documentation
- [ ] Check resolved issues

### Monthly
- [ ] Comprehensive security review
- [ ] Rotate API keys (every 90 days)
- [ ] Update security policies
- [ ] Audit user access
- [ ] Review RLS policies

## 📞 Getting Help

### Resources
- Security Advisor: `http://localhost:3001/security-advisor`
- Documentation: `docs/SECURITY_MONITORING_GUIDE.md`
- Security Guide: `docs/SECURITY_REMEDIATION_GUIDE.md`

### Issues
- Check console logs for errors
- Review Security Advisor findings
- Consult troubleshooting guide
- Ask in community forums

## 🚀 Next Steps

1. **Start Monitoring**: Run your first check
2. **Set Schedule**: Establish weekly routine
3. **Track Progress**: Monitor improvements
4. **Automate**: Set up automated checks
5. **Iterate**: Improve based on findings

---

**Remember**: Good security monitoring is consistent. Small, regular checks prevent big problems.

Happy monitoring! 🔒📊
