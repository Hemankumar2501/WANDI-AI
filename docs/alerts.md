# WanderWiseAI — Alert Configuration

## Production Alerts

### P1 — Critical (PagerDuty — immediate)

| Alert                   | Metric                                          | Threshold         | Action                                  |
| ----------------------- | ----------------------------------------------- | ----------------- | --------------------------------------- |
| Amadeus Error Rate      | `wanderwiseai.tool.errors{tool_name:amadeus_*}` | > 0.5% over 5 min | Page on-call, check Amadeus status page |
| Stripe Webhook Failures | `wanderwiseai.tool.errors{tool_name:stripe_*}`  | > 0 in 1 min      | Page on-call, check webhook logs        |
| Database Unreachable    | `/api/health` → `services.supabase = 'error'`   | Any occurrence    | Page on-call, check Supabase status     |

### P2 — High (PagerDuty — 15 min response)

| Alert                 | Metric                                     | Threshold      | Action                                           |
| --------------------- | ------------------------------------------ | -------------- | ------------------------------------------------ |
| Agent P95 Latency     | `wanderwiseai.agent.latency` P95           | > 8 seconds    | Investigate model selection, check OpenAI status |
| Redis Connection Loss | `/api/health` → `services.redis = 'error'` | Any occurrence | Check Upstash dashboard                          |

### P3 — Warning (Slack #alerts)

| Alert            | Metric                              | Threshold        | Action                                 |
| ---------------- | ----------------------------------- | ---------------- | -------------------------------------- |
| Daily AI Cost    | `wanderwiseai.token.cost` daily sum | > $50            | Review usage patterns, check for abuse |
| Agent Error Rate | `wanderwiseai.agent.errors`         | > 5% over 1 hour | Review error logs                      |

### Security (Slack #security)

| Alert             | Metric                                     | Threshold          | Action                            |
| ----------------- | ------------------------------------------ | ------------------ | --------------------------------- |
| Injection Attempt | `wanderwiseai.security.injection_attempts` | Any occurrence     | Review logs, no user data exposed |
| Rate Limit Spike  | 429 response count                         | > 10 per user/hour | Investigate, possible abuse       |

## Dashboard Panels

1. **Agent Latency** — P50, P95, P99 by agent type (histogram)
2. **Request Volume** — by agent type (time series)
3. **Error Rate** — by agent type (time series)
4. **AI Spend** — daily cost per user (gauge)
5. **Tool Performance** — latency by tool name (histogram)
6. **Active Sessions** — Redis session count (gauge)
7. **Memory Usage** — Pinecone vector count per namespace
8. **Health Status** — service status overview

## LangSmith Configuration

- **Project**: `wanderwiseai-prod`
- **Tags per run**: `agent_type`, `intent`, `model`, `user_id_hash`
- **Tracked metrics**: `tokens_in`, `tokens_out`, `latency_ms`, `cost_usd`
- **Error handling**: Set run status to `error` with full error object
- **Sampling**: 100% in dev, 10% in production (adjust based on volume)
