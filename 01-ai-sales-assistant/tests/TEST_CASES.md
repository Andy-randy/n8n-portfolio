# Manual test scenarios

These scenarios are import-and-run checks, not automated tests.

| ID | Scenario | Input / precondition | Expected result | Covered failure mode |
|---|---|---|---|---|
| AS-01 | Happy path | Customer provides every required order field | Confirmation marker is parsed, row is appended, manager is notified | — |
| AS-02 | Missing phone | Conversation contains every field except phone | Agent asks one follow-up question; no order row is created | Missing required data |
| AS-03 | Out-of-scope question | Customer asks about an unrelated topic | Assistant declines and redirects to the business scope | Prompt boundary |
| AS-04 | Malformed completion | Model returns `ЗАПИСЬ:` without every delimiter | Order branch must be reviewed; brittle split expressions can fail | Malformed AI output |
| AS-05 | Sheets failure | Google Sheets credential is unavailable | Order persistence fails and the execution records the integration error | External integration failure |
| AS-06 | Manager notification failure | Manager chat is unreachable after the row append | Persisted order remains; notification failure is visible in execution history | Partial side-effect failure |
| AS-07 | New session | Different Telegram chat ID starts a conversation | Simple Memory uses an independent session key | State isolation |
